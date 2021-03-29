import {extend, override} from 'flarum/common/extend';
import app from 'flarum/app';
import Button from 'flarum/common/components/Button';

app.initializers.add('clarkwinkelmann-quiz-polls', () => {
    const {
        CreatePollModal,
        DiscussionPoll,
        EditPollModal,
    } = flarum.extensions['fof-polls'].components;

    extend(CreatePollModal.prototype, 'onsubmit', function () {
        this.correctAnswerIndex = null;
    });

    extend(CreatePollModal.prototype, 'displayOptions', function (vdom) {
        vdom.forEach((formGroup, index) => {
            const correct = this.correctAnswerIndex === index;

            formGroup.children.splice(1, 0, Button.component({
                className: 'Button Button--icon' + (correct ? ' active' : ''),
                icon: 'fas fa-check',
                title: app.translator.trans('clarkwinkelmann-poll-quiz.forum.set-answer-as-correct'),
                onclick: () => {
                    if (correct) {
                        this.correctAnswerIndex = null;
                    } else {
                        this.correctAnswerIndex = index;
                    }
                },
            }));
        });
    });

    override(CreatePollModal.prototype, 'onsubmit', function (original, event) {
        const originalSubmit = this.attrs.onsubmit;

        this.attrs.onsubmit = poll => {
            poll.correctAnswer = this.options[this.correctAnswerIndex]();

            originalSubmit(poll);
        };

        original(event);

        // Restore original in case the modal doesn't close and something else happens
        this.attrs.onsubmit = originalSubmit;
    });

    extend(EditPollModal.prototype, 'displayOptions', function (vdom) {
        this.options.forEach((option, index) => {
            const correct = option.attribute('correct');

            vdom[index].children.splice(1, 0, Button.component({
                className: 'Button Button--icon' + (correct ? ' active' : ''),
                icon: 'fas fa-check',
                title: app.translator.trans('clarkwinkelmann-poll-quiz.forum.set-answer-as-correct'),
                onclick: () => {
                    if (correct) {
                        option.pushAttributes({
                            correct: false,
                        });
                    } else {
                        // Remove correct from all other options
                        this.options.forEach(option => {
                            if (option.attribute('correct')) {
                                option.pushAttributes({
                                    correct: false,
                                });
                            }
                        });

                        option.pushAttributes({
                            correct: true,
                        });
                    }
                },
            }));
        });
    });

    extend(DiscussionPoll.prototype, 'view', function (vdom) {
        if (!this.poll.attribute('isQuiz')) {
            return;
        }

        vdom.attrs.className = (vdom.attrs.className || '') + ' Poll--quiz';

        if (!this.voted()) {
            return;
        }

        this.options.forEach((option, index) => {
            vdom.children[1].children[index].attrs.className += ' ' + (option.attribute('correct') ? 'PollOption--correct' : 'PollOption--wrong');
        });
    });
});
