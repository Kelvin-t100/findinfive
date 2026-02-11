const MAX_TRIES = 5;
const WORD_LENGTH = 5;

const WORDS = [
  "apple","bread","water","sugar","honey","table","chair","clock","phone","light",
  "paper","glass","plate","knife","spoon","shirt","shoes","socks","watch","towel",
  "house","couch","shelf","stove","cable","power","river","ocean","beach","cloud",
  "storm","windy","rainy","grass","plant","flora","stone","earth","field","trail",
  "flame","smoke","woods","plain","shore","smile","laugh","speak","think","learn",
  "teach","write","dance","carry","throw","catch","climb","build","break","begin",
  "close","clean","drink","drive","enjoy","enter","leave","share","sleep","spend",
  "start","happy","angry","proud","brave","tired","anime","eager","peace","trust",
  "doubt","worry","today","night","month","early","later","never","often","twice",
  "first","final","train","plane","route","visit","guest","hotel","lodge","clear",
  "fresh","grand","quiet","sharp","smart","solid","sweet","thick","rough","quick",
  "minor","major","grace","honor","truth","faith","sense","value","voice","dream",
  "story","scene","title","theme","pride","grape","lemon","peach","berry","mango",
  "olive","onion","spice","sauce","cheer","peace","relax","enjoy","smile","party",
  "sweet","light","fresh","quiet","tenth","seven","fifth"
];




// -------- LOAD SAVED STATE --------
let tries = localStorage.getItem("tries");
let guesses = localStorage.getItem("guesses");
let gameOver = localStorage.getItem("gameOver");
let currentStreak=Number(localStorage.getItem("currentStreak"))||0;
let bestStreak =Number(localStorage.getItem("bestStreak"))||0;
let firstMoveDone=false;
let adUsed = localStorage.getItem("adUsed") === "true";
let totalTries = Number(localStorage.getItem("totalTries")) || MAX_TRIES;
let roundLost=false;
roundLost=localStorage.getItem("roundLost")==="true";
let lastLostWord=localStorage.getItem("lastLostWord") || "";

// ------randomizer and localsave for no repeating
let usedWords = JSON.parse(localStorage.getItem("usedWords")) || [];
let SECRET_WORD = localStorage.getItem("secretWord") || "";
    if (!SECRET_WORD) {
    SECRET_WORD = pickNewWord();
     }

tries = tries !== null ? Number(tries) : MAX_TRIES;
guesses = guesses !== null ? JSON.parse(guesses) : [];
gameOver = gameOver === "true";

// -------- ELEMENTS --------
const grid = document.getElementById("grid");
const triesText = document.getElementById("tries");
const submitBtn = document.getElementById("submit");
const guessInput = document.getElementById("guess");
const message = document.getElementById("message");
const guessesDiv = document.getElementById("guesses");
const playAgainBtn = document.getElementById("playAgain");
const currentStreakText = document.getElementById("currentStreak");
const bestStreakText = document.getElementById("bestStreak");
const overlay = document.getElementById("overlay");
const endModal = document.getElementById("endModal");
const endTitle = document.getElementById("endTitle");
const modalCurrentStreak = document.getElementById("modalCurrentStreak");
const modalBestStreak = document.getElementById("modalBestStreak");
//const modalPlayAgain = document.getElementById("modalPlayAgain");
const correctWordText=document.getElementById("correctWordText");
const watchAdBtn =document.getElementById("watchAdBtn");
// -------- STATE VALIDATION --------
// if (gameOver && tries !== 0) {
//     gameOver = false;
//     saveState();
// }

// -------- INITIAL UI --------
updateUI();
updateStatsUI();

if (gameOver) {
    endGameUI();
}

// -------- EVENTS --------
submitBtn.addEventListener("click",handleSubmit);

playAgainBtn.addEventListener("click", function () {
    startNewGame();
});

guessInput.addEventListener("input", () => {
    guessInput.value = guessInput.value.toUpperCase();
});

guessInput.addEventListener("keydown",function(event){
    if(event.key==="Enter"){
        handleSubmit();
    }
}); 

watchAdBtn.addEventListener("click", () => {
    // simulate ad delay
    if(adUsed) return;
    watchAdBtn.disabled = true;
    watchAdBtn.textContent = "Watching ad...";
    setTimeout(() => {
        // reward user
        tries += 2;
        totalTries=MAX_TRIES+2;
        adUsed = true;
        roundLost=false;
        localStorage.setItem("tries", tries);
        localStorage.setItem("totalTries",totalTries);
        localStorage.setItem("adUsed", "true");
        localStorage.setItem("roundLost","false");
         localStorage.setItem("gameOver", "false");
        // close modal 
        gameOver = false;
        overlay.classList.add("hidden");
        endModal.classList.add("hidden");
        // resume game
       
       
        updateUI();
        guessInput.disabled = false;
        submitBtn.disabled = false;
        guessInput.focus();
      //  watchAdBtn.textContent = "Watch ad to get +2 tries";
        watchAdBtn.style.display ="none";
    }, 2000); // fake 2-second ad
});
// modalPlayAgain.addEventListener("click", () => {
//     console.log("ad button clicked");
//     overlay.classList.add("hidden");
//     endModal.classList.add("hidden");
//     startNewGame();
// });


// -------- FUNCTIONS --------
function handleSubmit() {
    
    if (gameOver || tries === 0) return;

    let guess = guessInput.value.trim().toLowerCase();

   if(guess.length!==WORD_LENGTH){
    message.textContent="word must be 5 letters";
    guessInput.classList.add("shake");
        setTimeout(() =>guessInput.classList.remove("shake"), 300);
    return;
   }
    if (!/^[a-zA-Z]+$/.test(guess)) {
        message.textContent = "Type letters only";
        guessInput.classList.add("shake");
        setTimeout(() =>guessInput.classList.remove("shake"), 300);
        return;
    }
    
    guessInput.disabled=true;
    submitBtn.disabled=true;

    message.textContent="";
    guessInput.value = "";
    guesses.push(guess);
    
    
    if(guess===SECRET_WORD){
        gameOver=true;
        localStorage.setItem("gameOver","true");
        message.textContent="You Won!";
        currentStreak++;
    if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
    }
    localStorage.setItem("currentStreak", currentStreak);
    localStorage.setItem("bestStreak", bestStreak);
    updateStatsUI();
        saveState();updateUI();
        endGameUI();return;
    }
    
    firstMoveDone=true;
    tries--;
    updateUI();
   

      if (tries === 0) {
        gameOver = true;
        roundLost=true;
        lastLostWord=SECRET_WORD;
        localStorage.setItem("roundLost","true");
        localStorage.setItem("gameOver","true");
        localStorage.setItem("lastLostWord",lastLostWord);
    updateStatsUI(); 
        saveState();
        endGameUI();
    }
    guessInput.disabled=false;
    submitBtn.disabled=false;
    guessInput.focus();
}

function saveState() {
    localStorage.setItem("tries", tries);
    localStorage.setItem("guesses", JSON.stringify(guesses));
    localStorage.setItem("gameOver", gameOver);
    localStorage.setItem("adUsed", adUsed);
    localStorage.setItem("roundLost",roundLost);
}

function startNewGame() {

    watchAdBtn.style.display = "none";

    if (roundLost && lastLostWord) {
        correctWordText.textContent =
            `The word was: ${lastLostWord.toUpperCase()}`;
        correctWordText.classList.remove("hidden");

        setTimeout(() => {
            correctWordText.classList.add("hidden");
            correctWordText.textContent = "";
            resetgame();
        }, 1500);
        return;
    }

    roundLost = false;
    adUsed = false;
    lastLostWord="";
    localStorage.setItem("roundLost", "false");
    localStorage.setItem("adUsed", "false");
    localStorage.setItem("lastLostWord","");

    totalTries = MAX_TRIES;
    localStorage.setItem("totalTries", totalTries);
    tries = MAX_TRIES;

    SECRET_WORD = pickNewWord();
    guesses = [];
    gameOver = false;
    firstMoveDone = false;

    overlay.classList.add("hidden");
    endModal.classList.add("hidden");

    saveState();
    message.textContent = "New game started!";
    playAgainBtn.style.display = "none";
    guessInput.disabled = false;
    submitBtn.disabled = false;
    guessInput.focus();

    updateUI();
}

function resetgame() {
    if(roundLost){
        currentStreak=0;
        localStorage.setItem("currentStreak",currentStreak);
        updateStatsUI();
    }
   watchAdBtn.disabled=false;
   watchAdBtn.textContent="watch ad to get +2 tries";
    watchAdBtn.style.display = "none";

    roundLost = false;
    adUsed = false;
    lastLostWord = "";

    localStorage.setItem("roundLost", "false");
    localStorage.setItem("adUsed", "false");
    localStorage.setItem("lastLostWord", "");

    totalTries = MAX_TRIES;
    localStorage.setItem("totalTries", totalTries);
    tries = MAX_TRIES;

    SECRET_WORD = pickNewWord();
    guesses = [];
    gameOver = false;
    firstMoveDone = false;

    overlay.classList.add("hidden");
    endModal.classList.add("hidden");

    saveState();

    message.textContent = "New game started!";
    playAgainBtn.style.display = "none";
    guessInput.disabled = false;
    submitBtn.disabled = false;
    guessInput.focus();

    updateUI();
}

function endGameUI() {
    overlay.classList.remove("hidden");
    endModal.classList.remove("hidden");

      playAgainBtn.style.display = "inline-block"; 

    if (tries === 0) {
        // watchAdBtn.style.display="inline-block";
        endTitle.textContent = "Game Over 😢";
       if(!adUsed){
         watchAdBtn.disabled = false;
        watchAdBtn.textContent = "Watch ad to get +2 tries";
        watchAdBtn.style.display="inline-block";
       }
       else{
        watchAdBtn.style.display="none";
       }
    } else {
        endTitle.textContent = "You Won! 🎉";
        watchAdBtn.style.display="none";
        correctWordText.classList.add("hidden");
    }

    modalCurrentStreak.textContent = currentStreak;
    modalBestStreak.textContent = bestStreak;

    guessInput.disabled = true;
    submitBtn.disabled = true;
}


function updateUI() {
    triesText.textContent = tries;
    renderGrid();
}

function updateStatsUI() {
    currentStreakText.textContent = currentStreak;
    bestStreakText.textContent = bestStreak;
}

function renderGrid() {
    grid.innerHTML = "";

  for (let row = 0; row < totalTries; row++) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "row";
        const word = guesses[row] || "";
        const isLatestRow = row === guesses.length - 1;
        const colors = word ? getLetterColors(word, SECRET_WORD) : [];

        for (let col = 0; col < WORD_LENGTH; col++) {
            const box = document.createElement("div");
            box.className = "box";
            if (word[col]) {
                box.textContent = word[col].toUpperCase();
                if (isLatestRow) {
                    box.classList.add("flipHidden");
                    setTimeout(() => {
                        box.classList.remove("flipHidden");
                        box.classList.add("reveal");
                    }, col * 150);
                    setTimeout(() => {
                        box.classList.add(colors[col]);
                    }, col * 150 + 150);
                } else {
                    box.classList.add("reveal");
                    box.classList.add(colors[col]);
                }
            } else {
                box.textContent = "";
            }
            rowDiv.appendChild(box);
        }
        grid.appendChild(rowDiv);
    }
}

///--- colour swap of grid box---
function getLetterColors(guess, secret) {
    const result = Array(WORD_LENGTH).fill("gray");
    const secretLetters = secret.split("");

    // 1️⃣ First pass — GREEN
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guess[i] === secret[i]) {
            result[i] = "green";
            secretLetters[i] = null;
        }
    }

    // 2️⃣ Second pass — YELLOW
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (result[i] === "gray" && secretLetters.includes(guess[i])) {
            result[i] = "yellow";
            secretLetters[secretLetters.indexOf(guess[i])] = null;
        }
    }

    return result;
}
//---- word randomizer---
function pickNewWord() {
    let available = WORDS.filter(w => !usedWords.includes(w));

    // If all words used, reset the pool
    if (available.length === 0) {
        usedWords = [];
        available = [...WORDS];
    }

    const word = available[Math.floor(Math.random() * available.length)];
    usedWords.push(word);

    localStorage.setItem("usedWords", JSON.stringify(usedWords));
    localStorage.setItem("secretWord", word);

    return word;
}


