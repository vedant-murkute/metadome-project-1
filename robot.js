const roads = [
    "Alice's House-Bob's House", "Alice's House-Cabin",
    "Alice's House-Post Office", "Bob's House-Town Hall",
    "Daria's House-Ernie's House", "Daria's House-Town Hall",
    "Ernie's House-Grete's House", "Grete's House-Farm",
    "Grete's House-Shop", "Marketplace-Farm",
    "Marketplace-Post Office", "Marketplace-Shop",
    "Marketplace-Town Hall", "Shop-Town Hall"
];


function buildGraph(edges) {
    let graph = Object.create(null);
    function addEdge(from, to) {
        if (graph[from] == null) {
            graph[from] = [to];
        } else {
            graph[from].push(to);
        }
    }
    for (let [from, to] of edges.map(r => r.split("-"))) {
        addEdge(from, to);
        addEdge(to, from);
    }
    return graph;
}
const roadGraph = buildGraph(roads);

class VillageState {

    constructor(place, parcels) {
        this.place = place;
        this.parcels = parcels;
    }

    move(destination) {
        if (!roadGraph[this.place].includes(destination)) {
            return this;
        } else {
        let parcels = this.parcels.map(p => {
            if (p.place != this.place) return p;
            return {place: destination, address: p.address};
        }).filter(p => p.place != p.address);
        return new VillageState(destination, parcels);
        }
    }
}

//simulation
function runRobot(state, robot, memory) {
    for (let turn = 0;; turn++) {
        if (state.parcels.length == 0) {
            // console.log(`Done in ${turn} turns`);
            // break;
            return turn;
        }
        let action = robot(state, memory);
        state = state.move(action.direction);
        memory = action.memory;
        //console.log(`Moved to ${action.direction}`);
    }
}

//generating a task
function randomPick(array) {
    let choice = Math.floor(Math.random() * array.length);
    return array[choice];
}

VillageState.random = function(parcelCount = 5) {
    let parcels = [];
    for (let i = 0; i < parcelCount; i++) {
        let address = randomPick(Object.keys(roadGraph));
        let place;
        do {
            place = randomPick(Object.keys(roadGraph));
        } while (place == address);
        parcels.push({place, address});
    }
    return new VillageState("Post Office", parcels);
};

//logic for robots

//#1
//random routes
function randomRobot(state) {
    return {direction: randomPick(roadGraph[state.place])};
}

//#2
//bfs - shortest route
function findRoute(graph, from, to) {
    let work = [{at: from, route: []}];
    for (let i = 0; i < work.length; i++) {
        let {at, route} = work[i];
        for (let place of graph[at]) {
            if (place == to) return route.concat(place);
            if (!work.some(w => w.at == place)) {
                work.push({at: place, route: route.concat(place)});
            }
        }
    }
}

function goalOrientedRobot({place, parcels}, route) {
    if (route.length == 0) {
        let parcel = parcels[0];
        if (parcel.place != place) {
            route = findRoute(roadGraph, place, parcel.place);
        } else {
            route = findRoute(roadGraph, place, parcel.address);
        }
    }
    return {direction: route[0], memory: route.slice(1)};
}

//running the simulation
// console.log(runRobot(VillageState.random(), randomRobot, []));

//efficieny comaprison
function compareRobots(robot1,memory1,robot2,memory2){
    let avgSteps1=0;
    let avgSteps2=0;
    for(let i=0;i<100;i++){
        let state = VillageState.random();
        avgSteps1 += runRobot(state, robot1, memory1)/100;
        avgSteps2 += runRobot(state, robot2, memory2)/100;
    }
    console.log(`Efficiency of robot1 is ${avgSteps1} and robot2 is ${avgSteps2}`)
}

compareRobots(goalOrientedRobot,[],distanceOrientedRobot,[]);

//more efficent robot
function distanceOrientedRobot({place, parcels}, route){
    if(route.length==0){
        let routes = parcels.map(parcel => {
            if (parcel.place != place) {
                return findRoute(roadGraph, place, parcel.place);
            } else {
                return findRoute(roadGraph, place, parcel.address);
            }
        });
        route = routes.reduce((x,y) => {
            if(x.length < y.length) return x;
            return y; 
        });
    }
    return {direction: route[0], memory: route.slice(1)};
}