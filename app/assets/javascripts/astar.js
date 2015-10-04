var astar = {
    //initializes each cell with the necessary variables
    init: function(grid) {
        for(var x = 0; x < grid.length; x++) {
            for(var y = 0; y < grid[x].length; y++) {
                var cell = grid[x][y];
                cell.f = 0;
                cell.g = 0;
                cell.h = 0;
                cell.cost = 1;
                cell.visited = false;
                cell.closed = false;
                cell.parent = null;
                cell.total = 0;
            }
        }
    },

    //creates a binary heap to keep the cells sorted correctly
    heap: function() {
        return new BinaryHeap(function(cell) {
            return cell.f;
        });
    },

    //performs the search supplied with the grid, starting cell, goal cell, boolean for diagonals, and boolean for heuristic
    search: function(grid, start, goal, diagonal, heuristic) {
        astar.init(grid);
        start.f = 0;
        start.g = 0;
        start.h = 0;
        start.cost = 1;
        start.visited = false;
        start.closed = false;
        start.parent = null;
        heuristic = heuristic || astar.distance;
        diagonal = !!diagonal;

        var openHeap = astar.heap();

        openHeap.push(start);

        while(openHeap.size() > 0) {

            // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
            var currentCell = openHeap.pop();

            // End case -- result has been found, return the traced path.

            if(currentCell.attr('id') === goal.attr('id')) {
                var curr = currentCell;
                var ret = [];
                while(curr.parent) {
                    ret.push(curr);
                    curr = curr.parent;
                }
                return ret.reverse();
            }

            // Normal case -- move currentCell from open to closed, process each of its neighbors.
            currentCell.closed = true;

            // Find all neighbors for the current cell. Optionally find diagonal neighbors as well (false by default).
            var neighbors = astar.neighbors(grid, currentCell, diagonal);

            for(var i=0; i < neighbors.length; i++) {
                var neighbor = neighbors[i];

                if(neighbor.closed) {
                    // Not a valid cell to process, skip to next neighbor.
                    continue;
                }

                if(neighbor.hasClass('rock'))
                {
                  continue;
                }

                // The g score is the shortest distance from start to current cell.
                // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
                var gScore = currentCell.g + neighbor.cost;
                var beenVisited = neighbor.visited;

                if(!beenVisited || gScore < neighbor.g) {

                    // Found an optimal (so far) path to this node.  Take score for cell to see how good it is.
                    neighbor.visited = true;
                    neighbor.parent = currentCell;
                    neighbor.h = neighbor.h || heuristic(neighbor, goal);
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;

                    if (!beenVisited) {
                        // Pushing to heap will put it in proper place based on the 'f' value.
                        openHeap.push(neighbor);
                    }
                    else {
                        // Already seen the cell, but since it has been rescored we need to reorder it in the heap
                        openHeap.rescoreElement(neighbor);
                    }
                }
            }
        }

        //return empty array if no path was found
        return [];
    },

    //calculates the manhattan distance between a neighbor cell and the goal state
    distance: function(neighbor, goal) {
        var str1 = goal.attr('id');
        var str2 = neighbor.attr('id');
        var d1 = Math.abs (parseInt(str1.split(',', 1)) - parseInt(str2.split(',', 1)));
        var d2 = Math.abs (parseInt(str1.split(',').pop()) - parseInt(str2.split(',').pop()));
        var total = d1 + d2;
        neighbor.total = total;
        return total;
    },

    //returns all neighbors of the cell passed in
    neighbors: function(grid, cell, diagonals) {

        for(var i = 0; i < grid.length; i++)
        {
          for(var k = 0; k < grid[i].length; k++)
          {
            if(cell.attr('id') === grid[i][k].attr('id'))
            {
              var x = i;
              var y = k;
            }
          }
        }
        var neighbors = [];

        // North
        if(grid[x-1] && grid[x-1][y]) {
            neighbors.push(grid[x-1][y]);
        }

        // South
        if(grid[x+1] && grid[x+1][y]) {
            neighbors.push(grid[x+1][y]);
        }

        // West
        if(grid[x] && grid[x][y-1]) {
            neighbors.push(grid[x][y-1]);
        }

        // East
        if(grid[x] && grid[x][y+1]) {
            neighbors.push(grid[x][y+1]);
        }

        if (diagonals) {

            // Northwest
            if(grid[x-1] && grid[x-1][y-1]) {
                neighbors.push(grid[x-1][y-1]);
            }

            // Southwest
            if(grid[x+1] && grid[x+1][y-1]) {
                neighbors.push(grid[x+1][y-1]);
            }

            // Northeast
            if(grid[x-1] && grid[x-1][y+1]) {
                neighbors.push(grid[x-1][y+1]);
            }

            // Southeast
            if(grid[x+1] && grid[x+1][y+1]) {
                neighbors.push(grid[x+1][y+1]);
            }

        }

        return neighbors;
    }
};
