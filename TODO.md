# TODO

## High Priority

- ... 

## Medium Priority

- ~~Auto-detect transpositions and join nodes in the graph — FEN comparison across nodes~~ Done
- Ability to draw arrows and paint squares of different colors on the board, saved per node
- When I drag a node, it goes back to its orginal position if i select another node.

## Low Priority

- CI / CD
- Groupings (folders) of graphs
- More optional views: top-down, floating window
- Dark/light themes
- Convert the repertoire on my main obsidian as an example graph to show the users. Use the full lenght of the features (tags, colors, branches, transpositions, etc)
- ~~Clear and delete buttons when clicked leave a ugly rectagle selection after ESC. Remove the selection rectangle.~~ Done
- When a tag is added to a node, it off-centers the node a tiny bit

## Accessibility

- ...

## New Features

- v2: login

## Done

- ...

## Improvements
- Are we using too much storage? Should we implement a compression strategy to save the graphs on the browser?
- ~~The details shown in the root node vs the rest change significantly and its confusing when you navigate the position. The moves and tags row disappear, the FEN row changes its hight because it has no characters inside. We should normalize all of that.~~ Done
- ~~Arrows dont appear on the bottom right overview of the graph.~~ Skipped — React Flow MiniMap framework limitation
- ~~White pieces have black deltails but black pieces dont have white details.~~ Done
- Flip board option that gets saved to the entire graph, so it always renders the same.
- Nodes born from another node should maintain its parent color.

## Security
- Should we make sure editing the json of the graph is not possible / detect when it was tampered? Is that a security risk?

