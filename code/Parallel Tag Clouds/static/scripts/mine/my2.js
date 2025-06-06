const window_num = 10;
const start_date = '2023-04-17';
const end_date = '2023-08-20';
const only_phrase = 1;
let svg_width = 1500;
const svg_height = 1000;
const min_col_width = 150;
const text_gap = 8;
const colors = ["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"];
const col_width = Math.max(min_col_width, svg_width / window_num);
let sort_type = 'G2';

const Topics = [
    {name: '移民与抗议', color: '#a6cee3'},
    {name: '灾害与气候变化', color: '#1f78b4'},
    {name: '俄乌冲突', color: '#b2df8a'},
    {name: '特朗普调查', color: '#33a02c'},
    {name: '工资和税收政策', color: '#fb9a99'},
    {name: '新能源与科技发展', color: '#e31a1c'},
    {name: '体育赛事与娱乐', color: '#fdbf6f'},
    {name: '中东局势', color: '#ff7f00'},
    {name: '通货膨胀和经济表现', color: '#cab2d6'},
    {name: '政府服务和支持', color: '#6a3d9a'},
    {name: '国际关系与外交会谈', color: '#ffff99'},
    {name: '州级立法和教育政策', color: '#b15928'},
    {name: '紧急事故与搜救行动', color: '#eca0a5'},
    {name: '选举与竞选', color: '#abbffb'},
    {name: '英国王室与家庭故事', color: '#ffd3ae'}
];

const svg = d3.select('body')
    .append('svg')
    .attr('width', svg_width)
    .attr('height', svg_height);

const line = d3.line().x((d) => d[0]).y((d) => d[1]);
let all_texts, focus_texts;
let all_paths, focus_paths;
const area_data = [];

const menu = [
    {
        title: 'Sort by G2',
        action: function () {
            d3.selectAll('.col_g')
                .each(function () {
                    d3.select(this).selectAll('.text_g')
                        .transition()
                        .duration(1000)
                        .attr('transform', d => `translate(0, ${d.y1})`);
                });
            sort_type = 'G2';
            all_texts = undefined;
            all_paths = undefined;
            menu[0]['disabled'] = true;
            menu[1]['disabled'] = false;
            update_paths();
            update_areas();
        },
        disabled: true
    },
    {
        title: 'Sort by Topic',
        action: function () {
            d3.selectAll('.col_g')
                .each(function () {
                    d3.select(this).selectAll('.text_g')
                        .transition()
                        .duration(1000)
                        .attr('transform', d => `translate(0, ${d.y2})`);
                });
            sort_type = 'Topic';
            all_texts = undefined;
            all_paths = undefined;
            menu[0]['disabled'] = false;
            menu[1]['disabled'] = true;
            update_paths();
            update_areas();
        },
        disabled: false
    }
];

svg.append('rect')
    .attr('width', svg_width)
    .attr('height', svg_height)
    .attr('fill', 'white')
    .attr('stroke', '#888')
    .on('contextmenu', d3.contextMenu(menu));

const areas_g = svg.append('g').attr('id', 'areas_g');
const paths_g = svg.append('g').attr('id', 'paths_g');
const cols_g = svg.append('g').attr('id', 'cols_g');

const gradientStops = [
    {'pos': "0%", 'opc': 1},
    {'pos': "20%", 'opc': 0},
    {'pos': "80%", 'opc': 0},
    {'pos': "100%", 'opc': 1},
];
const texts2data = new Map();

svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .selectAll("stop")
    .data(gradientStops)
    .enter()
    .append("stop")
    .attr("offset", d => d.pos)
    .attr("stop-color", "#6ea4f1")
    .attr("stop-opacity", d => d.opc);


d3.json('../static/data/handled_data.json').then(function (data) {
    const values = data.map(d => d.words.map(d => d.value)).flat();
    const domain = d3.extent(values);
    const value2size = d3.scaleLog()
        .domain(domain)
        .range([5, 20]);

    cols_g.selectAll('.col_g')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'col_g')
        .attr('transform', (d, i) => `translate(${i * col_width}, 0)`)
        .each(function (group_d, group_id) {
            const col_g = d3.select(this);
            col_g.append('text')
                .attr('alignment-baseline', 'hanging')
                .attr('text-anchor', 'middle')
                .attr('font-size', 15)
                .attr('x', col_width / 2)
                .attr('y', 5)
                .attr('font-weight', 'bolder')
                .attr('front', 'Space Mono')
                .text(group_d.window.replace(/2023-/g, ''));

            let y = 15;
            let trunc_index = 0;
            col_g.selectAll('.text_g')
                .data(group_d.words)
                .enter()
                .append('g')
                .attr('class', 'text_g')
                .each(function (d, i) {
                    const text_g = d3.select(this);
                    d.x = col_width / 2;
                    const text = text_g.append('text')
                        .attr('class', 'text')
                        .attr('alignment-baseline', 'middle')
                        .attr('text-anchor', 'middle')
                        .attr('x', col_width / 2)
                        .attr('font-size', value2size(d.value))
                        .attr('font', 'Helvetica')
                        .attr('fill', 'black')
                        .style('pointer-events', 'all')
                        .on('mouseover', function (t) {
                            if (!all_texts) all_texts = svg.selectAll('.text');
                            focus_texts = all_texts
                                .filter(w => w.word === t.word)
                                .attr('font-weight', 'bolder');
                            if (!all_paths) all_paths = svg.selectAll('.path');
                            focus_paths = all_paths.filter(p => p.word === t.word)
                                .attr('stroke', '#ff6b6b')
                                .raise();
                        })
                        .on('mouseout', function (t) {
                            if (focus_texts) focus_texts.attr('font-weight', 'normal');
                            if (focus_paths) focus_paths.attr('stroke', 'url(#gradient)');
                        })
                        .text(t => t.word);
                    const box = text.node().getBBox();
                    d.width = box.width;
                    d.height = box.height;
                    d.group_id = group_id;
                    d.topic_id = d['pros'][0].topic_id;
                    y += d.height + text_gap;
                    d.y1 = y - d.height / 2;
                    text_g.attr('transform', `translate(0, ${d.y1})`);
                    if ((y + d.height / 2 + 3) < svg_height) trunc_index = i + 1;
                });

            col_g.selectAll('.text_g').filter(d => (d.y1 + d.height + 3) >= svg_height).remove();
            group_d.words = group_d.words.slice(0, trunc_index);
            for (const d of group_d.words) {
                const temp = texts2data.get(d.word);
                if (temp) temp.push(d)
                else texts2data.set(d.word, [d]);
                d.left_x = group_id * col_width + col_width / 2 - d.width / 2 - 2;
                d.right_x = group_id * col_width + col_width / 2 + d.width / 2 + 2;
            }

            col_g.selectAll('.text_g')
                .each(function () {
                    d3.select(this).append('g')
                        .attr('class', 'bar_g')
                        .attr('transform', d => `translate(${col_width / 2}, ${d.height / 2})`)
                        .each(function (d) {
                            const pros = d['pros'];
                            pros.push({'topic_id': -1, 'pro': Math.max(1 - d3.sum(pros, d => d.pro), 0)});
                            const bar_data = [];
                            let acc_p = 0
                            for (const p of pros) {
                                const x = acc_p * d.width - d.width / 2;
                                acc_p += p.pro;
                                const color = p.topic_id === -1 ? '#888' : Topics[p.topic_id].color;
                                bar_data.push({'x': x, 'width': p.pro * d.width, 'color': color});
                            }
                            d3.select(this)
                                .selectAll('rect')
                                .data(bar_data)
                                .enter()
                                .append('rect')
                                .attr('x', d => d.x)
                                .attr('y', -2)
                                .attr('width', d => d.width)
                                .attr('height', 3)
                                .attr('fill', d => d.color);
                        });

                })

            y = 15;
            group_d.words.sort((a, b) => (a.topic_id - b.topic_id));
            for (const d of group_d.words) {
                y += d.height + text_gap;
                d.y2 = y - d.height / 2;
            }
            group_d.words.push({'topic_id': -1});
            let area = [];
            let center_x = group_id * col_width + col_width / 2;
            for (let i = 1; i < group_d.words.length; i++) {
                const last = group_d.words[i - 1];
                const cur = group_d.words[i];

                if (last.topic_id === cur.topic_id) {
                    const up = [last.left_x - 2, last.y2 - last.height / 2];
                    up.width = last.width;
                    area.push(up);
                    const down = [last.left_x - 2, last.y2 + last.height / 2 + text_gap  / 2];
                    down.width = last.width;
                    area.push(down);
                } else {
                    const up = [last.left_x - 2, last.y2 - last.height / 2];
                    up.width = last.width;
                    area.push(up);
                    const down = [last.left_x - 2, last.y2 + last.height / 2 + text_gap  / 2];
                    down.width = last.width;
                    area.push(down);
                    const down_center = [center_x, down[1] + 2];
                    area.push(down_center);
                    for (let j = area.length - 2; j >= 0; j--) {
                        const p = area[j];
                        area.push([p[0] + p.width + 6, p[1]]);
                    }
                    const up_center = [center_x, area[area.length - 1][1] - 3];
                    area.push(up_center);
                    area.topic_id = last.topic_id;
                    area_data.push(area);
                    area = [];
                }
            }
            group_d.words.pop();
        });

    update_paths();
    update_areas();
});

function update_paths() {
    const line_data = [];
    for (const [text, data] of texts2data) {
        if (data.length >= 2) {
            for (let i = 1; i < data.length; i++) {
                const cur_d = data[i];
                const last_d = data[i - 1];
                if (cur_d.group_id === last_d.group_id + 1) {
                    const points = sort_type === 'G2' ? [[last_d.right_x, last_d.y1], [cur_d.left_x, cur_d.y1]]
                        : [[last_d.right_x, last_d.y2], [cur_d.left_x, cur_d.y2]];
                    points.word = text;
                    line_data.push(points);
                }
            }
        }
    }
    paths_g.selectAll('*').remove();
    if (sort_type === 'Topic') return;
    paths_g.selectAll('path')
        .data(line_data)
        .enter()
        .append('path')
        .attr('class', 'path')
        .attr('stroke-width', 5)
        .attr('d', d => line(d))
        .attr('stroke', 'url(#gradient)')
        .attr('opacity', 0)
        .transition()
        .delay(800)
        .duration(500)
        .attr('opacity', 1);
}

function update_areas() {
    const line = d3.line().curve(d3.curveCatmullRomClosed.alpha(0.8));
    areas_g.selectAll('*').remove();
    if (sort_type === 'G2') return;
    areas_g.selectAll('.area')
        .data(area_data)
        .enter()
        .append('path')
        .attr('class', 'area')
        .attr('fill', d => Topics[d.topic_id].color)
        .attr('d', d => line(d))
        .attr('fill-opacity', 0)
        .transition()
        .delay(1000)
        .duration(500)
        .attr('fill-opacity', 0.3);
}
// $.post('/get_data', {
//     'window_num': window_num,
//     'start_date': start_date,
//     'end_date': end_date,
//     'only_phrase': only_phrase
// }, function (data) {
//     data = JSON.parse(data);
//     console.log(data);
// });

