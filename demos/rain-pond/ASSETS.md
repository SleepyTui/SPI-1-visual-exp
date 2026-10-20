# 素材来源与拆分

视觉定稿的完整副本位于 `public/assets/reference-*.png`，迁移后无需依赖原工作区路径。

使用内置 imagegen 对前两张定稿分别编辑，生成两张无雨、无物件、无文字的底图，已保存为 `public/assets/frost-background.png` 和 `ink-background.png`。四个同目录 SVG 是按定稿物件的轮廓、配色和层级实现的可编辑素材；运行时加载一次并缓存为位图。随笔方向直接使用参数化路径。

## Frost prompt

Use case: precise-object-edit. Edit target: attached final Rain Pond design. Create a CLEAN STATIC BACKGROUND PLATE for a realtime game. Preserve EXACT canvas composition, square aspect, white airy backdrop, original organic cyan pond shoreline and its exact location, pale translucent blue water gradient and delicate texture. REMOVE ALL text, logos, LIVE marker, bottom icons, ALL falling rain, drops, splashes, ALL ripples and rings, the entire large leaf with its stem/shadow, and the entire bowl with shadow. Seamlessly fill those removed areas with continuous matching water or white background. Result should contain ONLY the clean empty pond and background, retaining the exceptionally refined luminous frosted glass/water look. No objects or marks in the water. Do not redesign the shoreline, camera or colors. This will be used behind moving rain and separate object sprites. Preserve the faint saturated clean cyan pool boundary.

## Ink prompt

Use case: precise-object-edit. Edit target: attached final Rain Pond woodblock/riso illustration. Extract a clean static game BACKGROUND PLATE. Preserve EXACT square composition and winding teal S river outline, paper-white banks, restrained grain and ink texture, grasses and stones along the banks, existing perspective and colors. Remove ALL text including Chinese title and English words, LIVE and icons, ALL falling rain lines, ALL splashes, drops and ripple rings, the lily pad and its shadow, the clay dish and its shadow. Fill deleted objects seamlessly with unbroken teal water or natural paper. Only river, paper, shore vegetation remain. Absolutely no baked-in rain or circular rings. Do not redesign or simplify the river. Maintain final illustration quality and subtle handmade print edges.
