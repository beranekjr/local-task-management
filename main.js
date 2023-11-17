const STATUS = {
    INCOMPLETE: 'incomplete',
    COMPLETE: 'complete'
};
const COLORS = ['.pink', '.blue', '.gray', '.green'];

const $root = { };
let storage = null;
let ui = null;

function initializeCache() {
    const $cards = $('.cards');
    const $create = $('.create');

    $root.$cards = $cards;
    $root.$create = $create;
    $root.$createTaskCta = $create.find('.js-create-task');
    $root.$taskTitle = $create.find('#title');
    $root.$taskTitle = $create.find('#title');
    $root.$taskContent = $create.find('#content');
}

function initializeEvents () {
    $root.$createTaskCta.on('click', function () {
        const title = $root.$taskTitle.val();
        const content = $root.$taskContent.val();

        if (!title) {
            $root.$taskTitle
                .siblings('.invalid-feedback')
                .text('Um titulo eh necessario para criar uma tarefa');
            return;
        }

        if (!content) {
            $root.$taskContent
                .siblings('.invalid-feedback')
                .text('Por favor preencha os detalhes da tarefa');
            return;
        }

        const cards = storage.createNewTask(title, content);

        ui.setCards(cards);
        ui.updateCardsList();
        ui.clearInputs();
    });

    $('body').on('click', '.task-delete', function () {
        const id = $(this).data('id');

        const cards = storage.removeCardById(id);

        ui.setCards(cards);
        ui.updateCardsList();
    });

    $('body').on('click', '.task-complete', function () {
        const id = $(this).data('id');

        const cards = storage.updateTaskStatus(id, STATUS.COMPLETE);

        ui.setCards(cards);
        ui.updateCardsList();
    });

    $('body').on('click', '.task-incomplete', function () {
        const id = $(this).data('id');

        const cards = storage.updateTaskStatus(id, STATUS.INCOMPLETE);

        ui.setCards(cards);
        ui.updateCardsList();
    })
}

class UI {
    constructor ($el, cards) {
        this.$root = $el;
        this.cards = cards;
    }

    setCards(cards) {
        this.cards = cards;
    }

    startSpinner() {
        $root.$cards.spinner().start();
    }

    stopSpinner() {
        $root.$cards.spinner().stop();
    }

    updateCardsList() {
        this.clearCards();

        this.cards.map(card => {
            let completed = card.status === STATUS.COMPLETE;

            let html = `
                <div class='task'>
                    <div class='task-title-container ${completed ? 'complete' : ''}'>
                        <h3>
                            ${card.title}
                        <h3>
                        <button class='task-delete' data-id='${card.id}'>
                            Deletar
                        </button>
                        ${
                            !completed
                            ?
                                `<button class='task-complete' data-id='${card.id}'>
                                    Finalizado
                                </button>`
                            :
                                `
                                <button class='task-incomplete' data-id='${card.id}'>
                                    Nao finalizado
                                </button>`
                        }
                    </div>
                    <div class='task-content-container'>
                        <p>${card.content}<p>
                    </div>
                </div>
            `;
            $root.$cards.append(html);
        });
    }

    clearCards() {
        $root.$cards.empty();
    }

    clearInputs() {
        $root.$taskTitle.val('');
        $root.$taskContent.val('');
    }
}

class LocalStorage {
    constructor () {
        if (window.localStorage.getItem('cards')) {
            this.cards = window.localStorage.getItem('cards');
            return;
        }

        this.cards = '[]';
        window.localStorage.setItem('cards', this.cards)
    }

    getCards () {
        return JSON.parse(this.cards);
    }

    setCards(cards) {
        this.cards = JSON.stringify(cards);
    }

    saveToLocalStorage(cards) {
        try {
            window.localStorage.setItem('cards', JSON.stringify(cards));
        } catch (error) {
            console.error(error);
        }
    }

    createNewTask(title, content) {
        const cards = this.getCards();
        const id = (new Date).getTime();
        const status = STATUS.INCOMPLETE;

        cards.push({
            id,
            title,
            content,
            status: status
        });

        this.setCards(cards);
        this.saveToLocalStorage(cards);

        return cards;
    }

    removeCardById(id) {
        const cards = this.getCards();
        const newCards = cards.filter(c => c.id !== id);

        this.setCards(newCards);
        this.saveToLocalStorage(this.getCards());

        return this.getCards();
    }

    updateTaskStatus(id, status) {
        const cards = this.getCards();

        const cardToUpdate = cards.find(c => c.id === id);
        const index = cards.indexOf(cardToUpdate);

        cards[index].status = status;

        this.setCards(cards);
        this.saveToLocalStorage(this.getCards());

        return this.getCards();
    }
}

function init() {
    initializeCache();

    initializeEvents();

    storage = new LocalStorage();

    ui = new UI($root, storage.getCards());
    ui.updateCardsList();
}

init();
