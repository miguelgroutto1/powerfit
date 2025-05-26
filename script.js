// Animações suaves ao scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Menu mobile
const menuButton = document.querySelector('.menu-mobile');
const navLinks = document.querySelector('.nav-links');

menuButton.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuButton.classList.toggle('active');
});

// Animação de entrada dos elementos
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.section, .assessment-card, .workout-day').forEach(el => {
    el.classList.add('animate-out');
    observer.observe(el);
});

// Gerenciador de treinos
class WorkoutManager {
    constructor() {
        this.workoutList = document.getElementById('workoutList');
        this.addButton = document.getElementById('addExercise');
        this.exercises = JSON.parse(localStorage.getItem('exercises')) || [];
        
        this.addButton.addEventListener('click', () => this.addExercise());
        this.loadExercises();
    }

    addExercise() {
        const exercise = {
            id: Date.now(),
            name: '',
            sets: '',
            reps: '',
            weight: ''
        };

        this.exercises.push(exercise);
        this.saveExercises();
        this.renderExercise(exercise);
    }

    renderExercise(exercise) {
        const row = document.createElement('tr');
        row.dataset.id = exercise.id;
        row.innerHTML = `
            <td><input type="text" class="exercise-input" value="${exercise.name}" placeholder="Nome do exercício"></td>
            <td><input type="number" class="sets-input" value="${exercise.sets}" placeholder="Séries"></td>
            <td><input type="number" class="reps-input" value="${exercise.reps}" placeholder="Repetições"></td>
            <td><input type="number" class="weight-input" value="${exercise.weight}" placeholder="Peso"></td>
            <td>
                <button class="action-button delete-exercise">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        this.workoutList.appendChild(row);

        // Event listeners para inputs
        row.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', () => this.updateExercise(exercise.id));
        });

        // Event listener para deletar
        row.querySelector('.delete-exercise').addEventListener('click', () => this.deleteExercise(exercise.id));
    }

    updateExercise(id) {
        const row = this.workoutList.querySelector(`tr[data-id="${id}"]`);
        const exercise = this.exercises.find(ex => ex.id === id);

        if (exercise && row) {
            exercise.name = row.querySelector('.exercise-input').value;
            exercise.sets = row.querySelector('.sets-input').value;
            exercise.reps = row.querySelector('.reps-input').value;
            exercise.weight = row.querySelector('.weight-input').value;

            this.saveExercises();
        }
    }

    deleteExercise(id) {
        this.exercises = this.exercises.filter(ex => ex.id !== id);
        this.workoutList.querySelector(`tr[data-id="${id}"]`).remove();
        this.saveExercises();
    }

    loadExercises() {
        this.workoutList.innerHTML = '';
        this.exercises.forEach(exercise => this.renderExercise(exercise));
    }

    saveExercises() {
        localStorage.setItem('exercises', JSON.stringify(this.exercises));
    }
}

// Rastreador de dieta
class DietTracker {
    constructor() {
        this.foodList = document.getElementById('foodList');
        this.addButton = document.getElementById('addFood');
        this.foods = JSON.parse(localStorage.getItem('foods')) || [];
        
        this.addButton.addEventListener('click', () => this.addFood());
        this.loadFoods();
        this.updateMacros();
    }

    addFood() {
        const nameInput = document.getElementById('foodName');
        const caloriesInput = document.getElementById('calories');

        const food = {
            id: Date.now(),
            name: nameInput.value,
            calories: parseInt(caloriesInput.value) || 0
        };

        if (food.name && food.calories) {
            this.foods.push(food);
            this.saveFoods();
            this.renderFood(food);
            this.updateMacros();

            nameInput.value = '';
            caloriesInput.value = '';
        }
    }

    renderFood(food) {
        const div = document.createElement('div');
        div.className = 'food-item';
        div.dataset.id = food.id;
        div.innerHTML = `
            <span>${food.name}</span>
            <span>${food.calories} kcal</span>
            <button class="action-button delete-food">
                <i class="fas fa-times"></i>
            </button>
        `;

        this.foodList.appendChild(div);

        div.querySelector('.delete-food').addEventListener('click', () => this.deleteFood(food.id));
    }

    deleteFood(id) {
        this.foods = this.foods.filter(food => food.id !== id);
        this.foodList.querySelector(`div[data-id="${id}"]`).remove();
        this.saveFoods();
        this.updateMacros();
    }

    updateMacros() {
        const totalCalorias = this.foods.reduce((sum, food) => sum + food.calories, 0);
        const totalProteinas = Math.round(totalCalorias * 0.3 / 4); // 30% das calorias de proteína
        const totalCarboidratos = Math.round(totalCalorias * 0.5 / 4); // 50% das calorias de carboidratos
        const totalGorduras = Math.round(totalCalorias * 0.2 / 9); // 20% das calorias de gordura

        document.getElementById('totalCalorias').textContent = totalCalorias;
        document.getElementById('totalProteinas').textContent = `${totalProteinas}g`;
        document.getElementById('totalCarboidratos').textContent = `${totalCarboidratos}g`;
        document.getElementById('totalGorduras').textContent = `${totalGorduras}g`;
    }

    loadFoods() {
        this.foodList.innerHTML = '';
        this.foods.forEach(food => this.renderFood(food));
    }

    saveFoods() {
        localStorage.setItem('foods', JSON.stringify(this.foods));
    }
}

// Calculadora de TMB
class TMBCalculator {
    constructor() {
        this.form = document.querySelector('.calculator-form');
        this.resultDiv = document.getElementById('resultadoTMB');
        
        document.getElementById('calcularTMB').addEventListener('click', () => this.calculateTMB());
    }

    calculateTMB() {
        const idade = parseInt(document.getElementById('idade').value);
        const peso = parseFloat(document.getElementById('peso').value);
        const altura = parseInt(document.getElementById('altura').value);
        const sexo = document.getElementById('sexo').value;
        const nivelAtividade = parseFloat(document.getElementById('nivelAtividade').value);

        if (idade && peso && altura) {
            let tmb;
            if (sexo === 'masculino') {
                tmb = 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * idade);
            } else {
                tmb = 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * idade);
            }

            const tdee = tmb * nivelAtividade;
            
            this.resultDiv.querySelector('p').textContent = `${Math.round(tdee)} kcal/dia`;
            this.resultDiv.classList.add('active');
        }
    }
}

// Navegação
const sections = document.querySelectorAll('section, header');
const navigationLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - sectionHeight/3)) {
            current = section.getAttribute('id');
        }
    });

    navigationLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Menu Mobile
const menuMobile = document.querySelector('.menu-mobile');
const navLinksDiv = document.querySelector('.nav-links');

menuMobile.addEventListener('click', () => {
    navLinksDiv.classList.toggle('active');
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    new WorkoutManager();
    new DietTracker();
    new TMBCalculator();
}); 