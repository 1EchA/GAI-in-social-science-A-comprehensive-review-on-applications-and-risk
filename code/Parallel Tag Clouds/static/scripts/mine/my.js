const window_num = 10;
const start_date = '2023-04-17';
const end_date = '2023-08-20';
const only_phrase = 1;
let svg_width = 1500;
const svg_height = 1000;
const min_col_width = 150;
const text_gap = 8;
const colors = ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"];
const col_width = Math.max(min_col_width, svg_width / window_num);

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

const menu = [
	{
		title: 'Sort by G2',
		action: function(d) {
			console.log('sort by G2')
		},
	},
	{
		title: 'Sort by Topic',
		action: function(d) {
			console.log('sort by topic');
		}
	}
]

const svg = d3.select('body')
    .append('svg')
    .attr('width', svg_width)
    .attr('height', svg_height);

svg.append('rect')
    .attr('width', svg_width)
    .attr('height', svg_height)
    .attr('fill', 'white')
    .attr('stroke', '#888')
    .on('contextmenu', d3.contextMenu(menu));

const gradientStops = [
    {'pos': "0%", 'opc': 1},
    {'pos': "20%", 'opc': 0},
    {'pos': "80%", 'opc': 0},
    {'pos': "100%", 'opc': 1},
]

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
    const value2opacity = d3.scaleLog()
        .domain(domain)
        .range([0.3, 1]);

    const texts2data = new Map();
    let all_texts;
    let focus_texts;
    let all_bg_rects;
    let focus_rects;

    const cols = svg.selectAll('.col_g')
        .data(data)
        .enter()
        .append('g')
        .attr('transform', (d, i) => `translate(${i * col_width}, 0)`)
        .each(function (group_d, group_id) {
            const col_g = d3.select(this);
            // col_g.append('rect')
            //     .attr('width', col_width)
            //     .attr('height', svg_height)
            //     .attr('stroke', 'black')
            //     .attr('fill', 'none')
            //     .attr('stroke-dasharray', '3, 5');
            col_g.append('text')
                .attr('alignment-baseline', 'hanging')
                .attr('text-anchor', 'middle')
                .attr('font-size', 15)
                .attr('x', col_width / 2)
                .attr('y', 5)
                .attr('font-weight', 'bolder')
                .attr('front', 'Space Mono')
                .text(group_d.window.replace(/2023-/g, ''))

            let y = 12;
            const text_g = col_g.append('g').attr('class', 'text_g');
            let trunc_index = 0;
            const texts = text_g.selectAll('text')
                .data(group_d.words)
                .enter()
                .append('text')
                .attr('class', 'word')
                .attr('alignment-baseline', 'middle')
                .attr('text-anchor', 'middle')
                .attr('x', d => d.x = col_width / 2)
                .attr('font-size', d => value2size(d.value))
                .attr('font', 'Helvetica')
                .attr('fill', 'black')
                // .attr('opacity', d => value2opacity(d.value))
                .style('pointer-events', 'all')
                .on('mouseover', function (d) {
                    if (!all_texts) all_texts = svg.selectAll('.word');
                    focus_texts = all_texts
                        .filter(w => w.word === d.word)
                        .attr('font-weight', 'bolder');
                    paths.filter(p => p.word === d.word)
                        // .attr('fill', '#ff6b6b')
                        .attr('stroke', '#ff6b6b')
                        .raise();
                    if (!all_bg_rects) all_bg_rects = svg.selectAll('.bg_rect');
                    // focus_rects = all_bg_rects
                    //     .filter(w => w.word === d.word)
                    //     .attr('stroke', 'red')
                    //     .attr('stroke-width', 2);
                })
                .on('mouseout', function (d) {
                    if (focus_texts) focus_texts
                        .attr('font-weight', 'normal');
                    paths.filter(p => p.word === d.word)
                        // .attr('stroke', '#77aaf2')
                        // .attr('fill', '#6ea4f1')
                        .attr('stroke', 'url(#gradient)');
                    // focus_rects.attr('stroke', 'none')
                })
                .text(d => d.word);
            texts.each(function (d, i) {
                const box = d3.select(this).node().getBBox();
                d.width = box.width;
                d.height = box.height;
                d.group_id = group_id;
                y += d.height + text_gap;
                d3.select(this).attr('y', d.y = y);
                if ((y + d.height / 2 + 3) < svg_height) trunc_index = i + 1;
            });

            texts.filter(d => (d.y + d.height / 2 + 3) >= svg_height).remove();
            group_d.words = group_d.words.slice(0, trunc_index);
            for (const d of group_d.words) {
                const temp = texts2data.get(d.word);
                if (temp) temp.push(d)
                else texts2data.set(d.word, [d]);
                d.left_x = group_id * col_width + col_width / 2 - d.width / 2 - 2;
                d.right_x = group_id * col_width + col_width / 2 + d.width / 2 + 2;
            }

            // const bg_rect_g = col_g.append('g').attr('class', 'bg_rect_g');
            // bg_rect_g.selectAll('rect')
            //     .data(group_d.words)
            //     .enter()
            //     .append('rect')
            //     .attr('class', 'bg_rect')
            //     .attr('x', d => col_width / 2 - d.width / 2 - 3)
            //     .attr('y', d => d.y - d.height / 2 - 1.5)
            //     .attr('width', d => d.width + 3 * 2)
            //     .attr('height', d => d.height + 2 * 1.5)
            //     // .attr('fill', '#76b7b2')
            //     .attr('fill', 'none')
            //     // .attr('fill-opacity', 0.5)
            //     .attr('rx', 3)
            //     .attr('ry', 3)
            //     .attr('stroke', '#ccc');
            text_g.raise();

            const topic_bar_g = col_g.append('g').attr('class', 'topic_bar_g');
            topic_bar_g.selectAll('.bar_g')
                .data(group_d.words)
                .enter()
                .append('g')
                .attr('class', 'bar_g')
                .attr('transform', d => `translate(${col_width / 2}, ${d.y + d.height / 2})`)
                .each(function (d) {
                    const pros = d['pros'];
                    pros.push({'topic_id': -1, 'pro': Math.max(1 - d3.sum(pros, d => d.pro), 0)});
                    const bar_data = [];
                    let acc_p = 0
                    for (const p of pros) {
                        const x = acc_p * d.width - d.width / 2;
                        acc_p += p.pro;
                        const color = p.topic_id === -1? '#888': Topics[p.topic_id].color;
                        bar_data.push({'x': x, 'width': p.pro * d.width, 'color': color});
                    }
                    const bar_g = d3.select(this);
                    bar_g.selectAll('rect')
                        .data(bar_data)
                        .enter()
                        .append('rect')
                        .attr('x', d => d.x)
                        .attr('y', -2)
                        .attr('width', d => d.width)
                        .attr('height', 3)
                        .attr('fill', d => d.color);
                });
        });

    // const line = d3.line()
    //     .curve(d3.curveLinearClosed)
    //     .x((d) => d[0])
    //     .y((d) => d[1]);
    //
    // const line_data = [];
    // const ratio = 0.65 / 2;
    // for (const [text, data] of texts2data) {
    //     if (data.length >= 2) {
    //         for (let i = 1; i < data.length; i++) {
    //             const cur_d = data[i];
    //             const last_d = data[i - 1];
    //             if (cur_d.group_id === last_d.group_id + 1) {
    //                 const dy_last = last_d.height * ratio;
    //                 const dy_cur = cur_d.height * ratio;
    //                 const points = [[last_d.right_x, last_d.y - dy_last],
    //                     [cur_d.left_x, cur_d.y - dy_cur],
    //                     [cur_d.left_x, cur_d.y + dy_cur],
    //                     [last_d.right_x, last_d.y + dy_last]];
    //                 points.word = text;
    //                 line_data.push(points);
    //             }
    //         }
    //     }
    // }

    const line = d3.line()
        .x((d) => d[0])
        .y((d) => d[1]);
    const line_data = [];
    for (const [text, data] of texts2data) {
        if (data.length >= 2) {
            for (let i = 1; i < data.length; i++) {
                const cur_d = data[i];
                const last_d = data[i - 1];
                if (cur_d.group_id === last_d.group_id + 1) {
                    const points = [[last_d.right_x, last_d.y], [cur_d.left_x, cur_d.y]];
                    points.word = text;
                    line_data.push(points);
                }
            }
        }
    }

    const paths = svg.append('g')
        .attr('id', 'line_g')
        .selectAll('path')
        .data(line_data)
        .enter()
        .append('path')
        // .attr('stroke', '#77aaf2')
        .attr('stroke-width', 2)
        .attr('d', d => line(d))
        .attr('stroke', 'url(#gradient)');

    cols.raise();

});


// $.post('/get_data', {
//     'window_num': window_num,
//     'start_date': start_date,
//     'end_date': end_date,
//     'only_phrase': only_phrase
// }, function (data) {
//     data = JSON.parse(data);
//     console.log(data);
// });

