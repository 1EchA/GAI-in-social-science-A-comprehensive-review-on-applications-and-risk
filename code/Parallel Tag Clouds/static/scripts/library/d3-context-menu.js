(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        let d3 = require('d3');
        module.exports = factory(d3);
    } else if (typeof define === 'function' && define.amd) {
        try {
            let d3 = require('d3');
        } catch (e) {
            d3 = root.d3;
        }

        d3.contextMenu = factory(d3);
        define([], function () {
            return d3.contextMenu;
        });
    } else if (root.d3) {
        root.d3.contextMenu = factory(root.d3);
    }
}(this,
    function (d3) {
        let utils = {
            noop: function () {
            },

            /**
             * @param {*} value
             * @returns {Boolean}
             */
            isFn: function (value) {
                return typeof value === 'function';
            },

            /**
             * @param {*} value
             * @returns {Function}
             */
            const: function (value) {
                return function () {
                    return value;
                };
            },

            /**
             * @param {Function|*} value
             * @param {*} [fallback]
             * @returns {Function}
             */
            toFactory: function (value, fallback) {
                value = (value === undefined) ? fallback : value;
                return utils.isFn(value) ? value : utils.const(value);
            }
        };

        // global state for d3-context-menu
        let d3ContextMenu = null;

        let closeMenu = function () {
            // global state is populated if a menu is currently opened
            if (d3ContextMenu) {
                d3.select('.d3-context-menu').remove();
                d3.select('body').on('mousedown.d3-context-menu', null);
                d3ContextMenu.boundCloseCallback();
                d3ContextMenu = null;
            }
        };

        /**
         * Calls API method (e.g. `close`) or
         * returns handler function for the `contextmenu` event
         * @param {Function|Array|String} menuItems
         * @param {Function|Object} config
         * @returns {?Function}
         */
        return function (menuItems, config) {
            // allow for `d3.contextMenu('close');` calls
            // to programatically close the menu
            if (menuItems === 'close') {
                return closeMenu();
            }

            // for convenience, make `menuItems` a factory
            // and `config` an object
            menuItems = utils.toFactory(menuItems);

            if (utils.isFn(config)) {
                config = {onOpen: config};
            } else {
                config = config || {};
            }

            // resolve config
            let openCallback = config.onOpen || utils.noop;
            let closeCallback = config.onClose || utils.noop;
            let positionFactory = utils.toFactory(config.position);
            let themeFactory = utils.toFactory(config.theme, 'd3-context-menu-theme');

            /**
             * Context menu event handler
             * @param {*} data
             * @param {Number} index
             */
            return function (data, index) {
                let element = this;

                // close any menu that's already opened
                closeMenu();

                // store close callback already bound to the correct args and scope
                d3ContextMenu = {
                    boundCloseCallback: closeCallback.bind(element, data, index)
                };

                // create the div element that will hold the context menu
                d3.selectAll('.d3-context-menu').data([1])
                    .enter()
                    .append('div')
                    .attr('class', 'd3-context-menu ' + themeFactory.bind(element)(data, index));

                // close menu on mousedown outside
                d3.select('body').on('mousedown.d3-context-menu', closeMenu);
                d3.select('body').on('click.d3-context-menu', closeMenu);

                let parent = d3.selectAll('.d3-context-menu')
                    .on('contextmenu', function () {
                        closeMenu();
                        d3.event.preventDefault();
                        d3.event.stopPropagation();
                    })
                    .append('ul');

                parent.call(createNestedMenu, element);

                // the openCallback allows an action to fire before the menu is displayed
                // an example usage would be closing a tooltip
                if (openCallback.bind(element)(data, index) === false) {
                    return;
                }

                //console.log(this.parentNode.parentNode.parentNode);//.getBoundingClientRect());   Use this if you want to align your menu from the containing element, otherwise aligns towards center of window

                // get position
                let position = positionFactory.bind(element)(data, index);

                let doc = document.documentElement;
                let pageWidth = window.innerWidth || doc.clientWidth;
                let pageHeight = window.innerHeight || doc.clientHeight;

                let horizontalAlignment = 'left';
                let horizontalAlignmentReset = 'right';
                let horizontalValue = position ? position.left : d3.event.pageX - 2;
                if (d3.event.pageX > pageWidth / 2) {
                    horizontalAlignment = 'right';
                    horizontalAlignmentReset = 'left';
                    horizontalValue = position ? pageWidth - position.left : pageWidth - d3.event.pageX - 2;
                }


                let verticalAlignment = 'top';
                let verticalAlignmentReset = 'bottom';
                let verticalValue = position ? position.top : d3.event.pageY - 2;
                if (d3.event.pageY > pageHeight / 2) {
                    verticalAlignment = 'bottom';
                    verticalAlignmentReset = 'top';
                    verticalValue = position ? pageHeight - position.top : pageHeight - d3.event.pageY - 2;
                }

                // display context menu
                d3.select('.d3-context-menu')
                    .style(horizontalAlignment, (horizontalValue) + 'px')
                    .style(horizontalAlignmentReset, null)
                    .style(verticalAlignment, (verticalValue) + 'px')
                    .style(verticalAlignmentReset, null)
                    .style('display', 'block');

                d3.event.preventDefault();
                d3.event.stopPropagation();


                function createNestedMenu(parent, root, depth = 0) {
                    let resolve = function (value) {
                        return utils.toFactory(value).call(root, data, index);
                    };

                    parent.selectAll('li')
                        .data(function (d) {
                            let baseData = depth === 0 ? menuItems : d.children;
                            return resolve(baseData);
                        })
                        .enter()
                        .append('li')
                        .each(function (d) {
                            // get value of each data
                            let isDivider = !!resolve(d.divider);
                            let isDisabled = !!resolve(d.disabled);
                            let hasChildren = !!resolve(d.children);
                            let hasAction = !!d.action;
                            let text = isDivider ? '<hr>' : resolve(d.title);

                            let listItem = d3.select(this)
                                .classed('is-divider', isDivider)
                                .classed('is-disabled', isDisabled)
                                .classed('is-header', !hasChildren && !hasAction)
                                .classed('is-parent', hasChildren)
                                .html(text)
                                .on('click', function () {
                                    // do nothing if disabled or no action
                                    if (isDisabled || !hasAction) return;

                                    d.action.call(root, data, index);
                                    closeMenu();
                                });

                            if (hasChildren) {
                                // create children(`next parent`) and call recursive
                                let children = listItem.append('ul').classed('is-children', true);
                                createNestedMenu(children, root, ++depth)
                            }
                        });
                }
            };
        };
    }
));
