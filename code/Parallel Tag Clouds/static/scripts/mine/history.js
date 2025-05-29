    // const line_data = [];
    // const ratio = 0.6 / 2;
    // for (const [text, data] of texts2data) {
    //     if (data.length >= 2) {
    //         data.sort((a, b) => a.x - b.x);
    //         const points = [];
    //         points.word = text;
    //         for (const [id, d] of data.entries()) {
    //             const dy = d.height * ratio;
    //             if (id === 0) {
    //                 points.push([d.right_x, d.y - dy]);
    //             } else if (id === data.length - 1) {
    //                 points.push([d.left_x, d.y - dy]);
    //             } else {
    //                 points.push([d.left_x, d.y - dy]);
    //                 points.push([d.right_x, d.y - dy]);
    //             }
    //         }
    //         const reversed_data = [...data].reverse();
    //         for (const [id, d] of reversed_data.entries()) {
    //             const dy = d.height * ratio;
    //             if (id === 0) {
    //                 points.push([d.left_x, d.y + dy]);
    //             } else if (id === data.length - 1) {
    //                 points.push([d.right_x, d.y + dy]);
    //             } else {
    //                 points.push([d.right_x, d.y + dy]);
    //                 points.push([d.left_x, d.y + dy]);
    //             }
    //         }
    //         line_data.push(points);
    //     }
    // }
    // const line = d3.link(d3.curveBumpX)
    //     .x((d) => d[0])
    //     .y((d) => d[1]);