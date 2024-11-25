const baseURL = "https://pokeapi.co/api/v2/pokemon/"
const game = document.querySelector('#game')
let pausedGame = true
let firstPick;
let matches;
const button = document.querySelector('#resetBtn')
//api fetch request on the pokemon api

//colors gotten from florin pop pokedex tutorial 

const colors = {
    fire: '#FDDFDF',
    grass: '#DEFDE0',
    electric: '#FCF7DE',
    water: '#DEF3FD',
    ground: '#f4e7da',
    rock: '#d5d5d4',
    fairy: '#fceaff',
    poison: '#98d7a5',
    bug: '#f8d5a3',
    dragon: '#97b3e6',
    psychic: '#eaeda1',
    flying: '#F5F5F5',
    fighting: '#E6E0D4',
    normal: '#F5F5F5'
};

const loadPokemon = async () => {
    //we want to get random pokemon ids, we need to generate an array/radomizer

    //will use a Set obj data structure. set ~ array, but no dupes
    //Set uses a lookup
    const wildPokemon = new Set();

    //until there is 8 in the size of wildPokemon, add a number to the set
    while (wildPokemon.size < 8) {
        const radomizer = Math.ceil(Math.random() * 150);
        wildPokemon.add(radomizer);
    }
    //array of random numbers to plug into the api request for random pokemon
    // console.log([...wildPokemon])

    const pokePromises = ([...wildPokemon]).map(el => fetch(baseURL + el))
    //to make all of these promises run at the same time, use promise.all
    const result = await Promise.all(pokePromises)
    //we need an array of responses from promises into objs
    //will return this object back
    return await Promise.all(result.map(res => res.json()));



}
//this is a functiton to display pokemon on screen
const displayPokemon = (pokemon) => {
    pokemon.sort(_ => Math.random() - 0.5);
    const pokemonHTML = pokemon.map(pokemon => {
        const type = pokemon.types[0]?.type?.name;
        const color = colors[type] ||'#F5F5F5';
        return `
          <div class="card" onclick="clickCard(event)" data-pokename="${pokemon.name}" style="background-color:${color};">
            <div class="front ">
            </div>
            <div class="back rotated" style="background-color:${color};">
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}"  />
            <h2>${pokemon.name}</h2>
            </div>
        </div>
    `}).join('');
    game.innerHTML = pokemonHTML;
}
const clickCard = (e) => {
    const pokemonCard = e.currentTarget;
    const [front, back] = getFrontAndBackFromCard(pokemonCard)
    if(front.classList.contains("rotated") || isPaused) {
        return;
    }
    isPaused = true;
    rotateElements([front, back]);
    if(!firstPick){
        firstPick = pokemonCard;
        isPaused = false;
    }
    else {
        const secondPokemonName = pokemonCard.dataset.pokename;
        const firstPokemonName = firstPick.dataset.pokename;
        if(firstPokemonName !== secondPokemonName) {
            const [firstFront, firstBack] = getFrontAndBackFromCard(firstPick);
            setTimeout(() => {
                rotateElements([front, back, firstFront, firstBack]);
                firstPick = null;
                isPaused = false;
            }, 500)    
        }else {
            matches++;
            if(matches === 8) {
                alert("YOU WIN!");
            }
            firstPick = null;
            isPaused = false;
        }
    }
    
}
const rotateElements = (elements) => {
    if (typeof elements !== 'object' || !elements.length)return;
    elements.forEach(element => element.classList.toggle("rotated"))
}

const getFrontAndBackFromCard = (card) => {
    const front = card.querySelector('.front')
    const back = card.querySelector('.back')
    return [front, back]
}

//this a function to reset the game and it will be async to other function
//we will do while we wait for the result of another function
function resetGame() {

    game.innerHTML = '';
    isPaused = true;
    firstPick = null;
    matches = 0;
    setTimeout(async () => {
        const loadedPokemon = await loadPokemon();
        displayPokemon([...loadedPokemon, ...loadedPokemon]);
        isPaused = false;
    },200)
    console.log('hi')
}

button.addEventListener('click',resetGame)
//call the function for pokemon