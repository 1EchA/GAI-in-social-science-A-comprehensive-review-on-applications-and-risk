function voronoiTreemap(data, {
    bind = null, // pass in a d3 selection i.e d3.select('class/div')
    width = 500,
    height = 500,
    margin = {top: 10, right: 10, bottom: 10, left: 10},
    treemapRadius = 205,
    treemapCenter = [width / 2, height / 2],
} = {}) {

    // set the dimensions and margins of the graph
    const w = width + margin.left + margin.right;
    const h = height + margin.top + margin.bottom;

    bind.selectAll('svg').remove();
    const svg = bind.append('svg')
        .attr('width', w)
        .attr('height', h)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // begin: constants
    const _2PI = 2 * Math.PI;
    // end: layout conf.
    const formatThousands = d3.format(',d');

    // begin: treemap conf.
    const _voronoiTreemap = d3.voronoiTreemap();
    let hierarchy;
    let circlingPolygon;
    // end: treemap conf.

    initData()
    initLayout(data)

    hierarchy = d3.hierarchy(data).sum(d => d.weight);
    _voronoiTreemap
        .clip(circlingPolygon)
        (hierarchy);

    drawTreemap(hierarchy);

    function initData(rootData) {
        circlingPolygon = computeCirclingPolygon(treemapRadius);
    }

    function computeCirclingPolygon(radius) {
        let points = 60;
        let increment = _2PI / points;
        let circlingPolygon = [];

        for (let a = 0, i = 0; i < points; i++, a += increment) {
            circlingPolygon.push(
                [radius + radius * Math.cos(a), radius + radius * Math.sin(a)]
            )
        }

        return circlingPolygon;
    }

    function initLayout(rootData) {
        const drawingArea = svg.append('g')
            .classed('drawingArea', true)
            .attr('transform', 'translate(' + [margin.left, margin.top] + ')');

        const treemapContainer = drawingArea.append('g')
            .classed('treemap-container', true)
            .attr('transform', 'translate(' + treemapCenter + ')');

        treemapContainer.append('path')
            .classed('world', false)
            .attr('transform', 'translate(' + [-treemapRadius, -treemapRadius] + ')')
            .attr('d', 'M' + circlingPolygon.join(',') + 'Z');
    }

    function drawTreemap(hierarchy) {
        const leaves = hierarchy.leaves();
        const _treemapContainer = svg.select('g.treemap-container');
        console.log('_treemapContainer', _treemapContainer);

        const cells = _treemapContainer.append('g')
            .classed('cells', true)
            .attr('transform', 'translate(' + [-treemapRadius, -treemapRadius] + ')')
            .selectAll('path.cell')
            .data(leaves)
            .join('path')
            .classed('cell', true)
            .attr('d', d => 'M' + d.polygon.join(',') + 'z')
            .attr('fill', d => d.parent.data.color);

        const labels = _treemapContainer.append('g')
            .classed('labels', true)
            .attr('transform', 'translate(' + [-treemapRadius, -treemapRadius] + ')')
            .selectAll('.label')
            .data(leaves)
            .join('g')
            .classed('label', true)
            .attr('transform', d => 'translate(' + [d.polygon.site.x, d.polygon.site.y] + ')');

        labels.append('text')
            .classed('name', true)
            .html(d => (d.data.weight < 1) ? d.data.code : d.data.name);
        labels.append('text')
            .classed('value', true)
            .text(d => formatThousands(d.data.weight));
    }
}

d3.json('data/data.json').then(function (data) {
    console.log(data);

    voronoiTreemap(data, {
        bind: d3.select('#my_div'),
        treemapRadius: 250
    })
})

