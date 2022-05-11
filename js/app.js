class Game {
    constructor() {

        this.categories = [];
        this.point = 0;
        this.accumulatedPoints = 0;
        this.difficulty = 1;
        this.category = null;
    }

    addCategory(level, difficulty, prize) {

        let category = new Category(level, difficulty, prize);
        this.categories.push(category);
        return category;
    }

    configure(questions) {

        // Recorre las preguntas y las agrega en la memoria
        for (let i = 0; i < questions.length; i++) {
            let category = questions[i];
            let newCategory = this.addCategory(category.level, category.difficulty, category.prize);

            for (let j = 0; j < category.questions.length; j++) {
                let question = category.questions[j];
                newCategory.addQuestion(question.question, question.correct, question.choices[0], question.choices[1], question.choices[2]);
            };
        };

        // Si hay datos guardados , entonces se cargan 
        if (localStorage.getItem('player') == null) {
            this.zero();
        }

        let player = JSON.parse(localStorage.getItem('player'));

        this.accumulatedPoints = player.accumulatedPoints;

        // Actualizar div de puntajes obtenidos
        if (this.accumulatedPoints > 0) {
            let points = document.getElementById('point');
            points.innerHTML = `Puntos: ${ this.accumulatedPoints }`;
        }
    }

    zero() {
        let newStart = {
            accumulatedPoints: 0
        };

        localStorage.setItem('player', JSON.stringify(newStart));
    }

    start() {
        this.newStart(this.difficulty);
    }

    newStart(difficulty) {
        // busca la categoria empezando desde la difcultad mas baja para adelante
        let category = this.categories.find(function(elemento) {
            return elemento.difficulty == difficulty;
        });

        game.category = category;

        let question = category.randomQuestion();

        this.showQuestion(question);
    }

    showQuestion(question) {
        // hace referencia a la instancia juego
        let game = this;

        // limpia el container del juego en el html
        this.clearContainer();

        // obtengo el container del juego
        let container = document.getElementById('quiz');

        // creo el espacio para el titulo de las preguntas
        let title = document.createElement('h3');
        title.innerHTML = question.question;
        container.append(title);

        // Creo un parrafo para los puntos en el html
        let paragraph = document.createElement('p');
        paragraph.classList.add('puntos');
        paragraph.innerHTML = `${ game.category.level } - Premio: ${ game.category.prize }`;
        container.append(paragraph);

        // Creo los botones de las respuestas
        let choices = question.choices.concat([question.correct]);
        choices.sort(function(a, b) {
            return Math.random() - 0.5;
        });

        for (let i = 0; i < choices.length; i++) {
            // Crea boton en el html
            let choice = choices[i];
            let button = document.createElement('button');
            button.innerHTML = choice;
            container.append(button);


            button.addEventListener('click', function(evento) {
                if (question.correctQuestion(evento.target.innerHTML)) {
                    // otorgo los puntos
                    game.point = game.point + game.category.prize;

                    if (game.difficulty == 5) {
                        // si llego a la dificultad final termino el juego
                        game.theEnd(false);
                    } else {
                        // pasa a la siguiente dificultad
                        game.difficulty++;
                        game.newStart(game.difficulty);
                    }
                } else {
                    game.theEnd(true);
                }
            });
        }
    }

    clearContainer() {
        let container = document.getElementById('quiz');
        container.innerHTML = '';

        // Actualiza puntos
        let points = document.getElementById('point');
        points.innerHTML = `Puntos: ${ this.point }`;
    }

    theEnd(forced) {
        this.clearContainer();

        // Limpia puntos
        document.getElementById('point').innerHTML = '';

        let container = document.getElementById('quiz');
        let message = '';
        let game = this;

        // Suma los puntos obtenidos
        game.accumulatedPoints = game.accumulatedPoints + game.point;

        // Actualiza datos
        this.updateData();

        if (forced) {
            // bad ending
            message = 'git gud';
        } else {
            // god ending
            message = 'winner, winner chicken dinner ';
        }

        let title = document.createElement('h2');
        title.innerHTML = message;
        container.append(title);

        let points = document.createElement('p');
        points.classList.add('points');
        points.innerHTML = `Obtuviste ${ game.point } puntos. Tenias ${ game.accumulatedPoints } puntos acumulados`;
        container.append(points);

        let reboot = document.createElement('button');
        reboot.innerHTML = 'Reintentar';
        container.append(reboot);

        let quit = document.createElement('button');
        quit.innerHTML = 'Salir';
        container.append(quit);

        // Eventos
        reboot.addEventListener('click', function(evento) {
            game.rebootGame();
        });

        quit.addEventListener('click', function(evento) {
            game.quit();
        });
    }

    updateData() {
        // Obtener datos actuales
        let data = JSON.parse(localStorage.getItem('player'));

        // Actualiza los valores
        data.accumulatedPoints = this.accumulatedPoints;

        // guarda nuevos datos
        localStorage.setItem('player', JSON.stringify(data));
    }

    rebootGame() {
        this.point = 0;
        this.difficulty = 1;
        this.start();
    }

    quit() {
        document.location.reload()
    }
}
class Category {
    constructor(level, difficulty, prize) {
        this.level = level;
        this.difficulty = difficulty;
        this.prize = prize;
        this.questions = [];
    }

    addQuestion(question, correct, op1, op2, op3) {
        let newQuestion = new Question(question, correct, op1, op2, op3);
        this.questions.push(newQuestion);
        return newQuestion;
    }

    randomQuestion() {
        // Mostrar preguntas de forma aleatoria
        this.questions.sort(function(a, b) {
            return Math.random() - 0.5;
        });

        return this.questions[0];
    }
}

class Question {
    constructor(question, correct, op1, op2, op3) {
        this.question = question;
        this.correct = correct;
        this.choices = [op1, op2, op3];
    }

    correctQuestion(answer) {
        return this.correct == answer;
    }
}

let game = new Game();


game.configure(data);

// Iniciar el juego
let startButton = document.getElementById('start');
startButton.addEventListener('click', function(evento) {
    game.start();
});