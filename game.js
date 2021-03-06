const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName('choice-text'));
const categorys = Array.from(document.getElementsByClassName('btn'));
const category = document.getElementById("category");
const progressText = document.getElementById('progressText');
const scoreText = document.getElementById('score');
const progressBarFull = document.getElementById("progressBarFull")
const loader = document.getElementById("loader");
const game = document.getElementById("game");
let currentChoices;
let correctAnswer;
let categorySelection;

let category_questions = {
    Sports : "https://opentdb.com/api.php?amount=10&category=21&difficulty=easy&type=multiple",
    General_Knowledge : "https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple",
    Science_Nature : "https://opentdb.com/api.php?amount=10&category=17&difficulty=easy&type=multiple",
    Geography : "https://opentdb.com/api.php?amount=10&category=22&difficulty=easy&type=multiple"
}

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0
let questionCounter = 0;
let availableQuestions = [];
let questions = [];


categorys.forEach(btn => {
    btn.addEventListener("click", e =>{
        categorySelection = e.target.dataset["text"];
        category.classList.add("hidden");
        loader.classList.remove("hidden");
        fetchQuestions(category_questions[categorySelection]);
    })
})

fetchQuestions = questionCategory =>{
    fetch(questionCategory)
    .then( res => {
        return res.json();
    }).then( loadedQuestions =>{
        questions = loadedQuestions.results.map(loadedQuestion =>{
            const formattedQuestion = {
                question: loadedQuestion.question
            };

            const answerChoices = [...loadedQuestion.incorrect_answers];
            formattedQuestion.answer = Math.floor(Math.random()*3) +1;
            answerChoices.splice(formattedQuestion.answer -1,0,loadedQuestion.correct_answer);
            answerChoices.forEach((choice, index)=>{
            formattedQuestion["choice" + (index+1)] = choice;
            })
            return formattedQuestion;
        })
        startGame();
    }).catch(err =>{
    console.error(err); 
    });
}
    

//Constants


const CORRECT_BONUS = 5;
const MAX_QUESTIONS = 10;

startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuestions = [...questions]
    getNewQuestion();
    loader.classList.add("hidden")
    game.classList.remove("hidden");
}

getNewQuestion = () => {
    if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS){
        localStorage.setItem("mostRecentScore", score);
        //go to the end page
        return window.location.assign('end.html');
    }

    questionCounter++;
    progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
    //Update progress bar

    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;


    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionIndex];
    question.innerHTML = currentQuestion.question;

    choices.forEach( choice => {
        const number = choice.dataset['number'];
        choice.innerHTML = currentQuestion['choice' + number];
    });

    currentChoices = document.getElementsByClassName("choice-text");
    availableQuestions.splice(questionIndex,1);

    acceptingAnswers = true;

}

choices.forEach(choice => {
    choice.addEventListener('click', e => {
        if(!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset["number"];

        const classToApply = selectedAnswer == currentQuestion.answer ? 'correct' : 'incorrect';


        selectedChoice.parentElement.classList.add(classToApply);

        if (classToApply === 'correct'){
            incrementScore(CORRECT_BONUS);
        } else{
            for(let i = 0; i<currentChoices.length; i++){
                if(currentChoices[i].dataset["number"] != currentQuestion.answer) continue;

                currentChoices[i].parentElement.classList.add("correct");
                currentChoices[i].classList.add("correctAnswer");
                
            }
        }
        
        correctAnswer = document.querySelector(".correctAnswer");
        

        setTimeout(() =>{
            selectedChoice.parentElement.classList.remove(classToApply);
            if(correctAnswer){
                correctAnswer.parentElement.classList.remove("correct");
                for (choice of document.querySelectorAll(".choice-text")) {
                    if (choice.classList.contains("correctAnswer")){
                        choice.classList.remove("correctAnswer");
                    }
                }
            }
            getNewQuestion();
            
        }, 1000);
        
    })
})
incrementScore = num =>{
    score += num;
    scoreText.innerText = score;
}

