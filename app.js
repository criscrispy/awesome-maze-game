//  Declaring Matter js variables
const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;

// Before refactoring
// const cells = 10;
// const width = 600;
// const height = 600;
// const unitLength = width / cells;
//
const cellsHorizontal = 14;
const cellsVertical = 10;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;




const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    },
});

Render.run(render);
Runner.run(Runner.create(), engine);


// Main outside walls of maze
const walls = [
    topRect = Bodies.rectangle(width / 2, 0, width, 2, {
        isStatic: true,
        label: "border"
    }),
    bottomRect = Bodies.rectangle(width / 2, height, width, 2, {
        isStatic: true,
        label: "border"
    }),
    rightRect = Bodies.rectangle(width, height / 2, 2, height, {
        isStatic: true,
        label: "border"
    }),
    lefttRect = Bodies.rectangle(0, height / 2, 2, height, {
        isStatic: true,
        label: "border"
    }),
]

World.add(world, walls);

// UTILS - shuffle function
const shuffle = arr => {
    let counter = arr.length;

    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);

        counter--;
        //Actual swapping is done here
        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;

    }
    return arr;
}

// The Maze' grid system
const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false)
    );

const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false))

const horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false))

// console.log('main grid', grid, 'vertical', verticals, 'horizontals', horizontals);

const startRow = Math.floor(Math.random() * cellsVertical); // Major understanding issue - why Cellsvertical ?
const startColumn = Math.floor(Math.random() * cellsHorizontal); // Major understanding issue - why Cellshorizontal ?

//cell recursion - Our method for the maze creation
const recurseThroughCell = (row, column) => {
    // If I have visited the cell at [row, column], then return 
    if (grid[row][column]) {
        return;
    }
    // Mark this cell as visited (aka starting cell for maze)
    grid[row][column] = true;

    // Assemble Randomly-ordered list of neigbours of the visited cell
    const neighbors = shuffle([
        [row - 1, column, 'up'], //Top cell
        [row, column + 1, 'right'], //Right cell
        [row + 1, column, 'down'], //Down cell
        [row, column - 1, 'left'], //left cell
    ]);

    //For each neighbour 
    for (const neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor; // Reminder: basically nextRow and nextColumn together represent a cell
        // See if the neighbor is out of bounds
        if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
            continue;
            // it skips over the rest of the steps in this particular loop 
            // and goes to the next neighbor pair/cell(nxRow, nxCol) in the for of loop
        }
        //If you have visisted this neighbor, move to the next neighbor
        if (grid[nextRow][nextColumn]) {
            continue;
        }

        // Remove a wall from horizontals or verticals
        if (direction === 'left') {
            verticals[row][column - 1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
        } else if (direction === 'up') {
            horizontals[row - 1][column] = true;
        } else {
            horizontals[row][column] = true;
        }

        // 
        recurseThroughCell(nextRow, nextColumn);
    }
}

recurseThroughCell(startRow, startColumn);

// Generating the horizontal sides of the cells - all the horizontal pieces of our maze
horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2, // x-position
            rowIndex * unitLengthY + unitLengthY, // y-position
            unitLengthX, // width
            //height
            2, {
            label: 'wall',
            isStatic: true,
            render: {
                fillStyle: 'red'
            }
        }
        );
        World.add(world, wall);
    })
})

// Generating the vertical sides of the cells - all the vertical pieces of our maze
verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            2,
            unitLengthY, {
            label: 'wall',
            isStatic: true,
            render: {
                fillStyle: 'red'
            }
        }
        );
        World.add(world, wall);
    })
})

// Goal for the maze
const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * .5,
    unitLengthY * .5,
    {
        label: 'ball',
        isStatic: true,
        render: {
            fillStyle: 'green'
        }
    }
);
World.add(world, goal);

// Ball 
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
    unitLengthX / 2, //  x-positions of the ball
    unitLengthY / 2, // y-positions of the ball
    ballRadius, // radius
    {
        label: 'ball',
        isStatic: false,
        render: {
            fillStyle: 'yellow'
        }
    }
);
World.add(world, ball);

//Ball movement
document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;

    if (event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') {
        Body.setVelocity(ball, { x, y: y - 5 });
    }
    if (event.key === 'd' || event.key === 'D' || event.key === 'ArrowRight') {
        Body.setVelocity(ball, { x: x + 5, y });

    }
    if (event.key === 's' || event.key === 'S' || event.key === 'ArrowDown') {
        Body.setVelocity(ball, { x, y: y + 5 });
    }
    if (event.key === 'a' || event.key === 'A' || event.key === 'ArrowLeft') {
        Body.setVelocity(ball, { x: x - 5, y });
    }
})

// Win condition 

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const labels = ['ball', 'goal']
        if (
            labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)
        ) {
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if (body.label !== 'border') { // verticals and horizontals have the 'wall' labels
                    Body.setStatic(body, false)
                }
            });
            // console.log('Maze completed 🥳');
        }
    })
});