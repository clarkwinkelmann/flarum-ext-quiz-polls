import {extend, override} from 'flarum/common/extend';
import app from 'flarum/app';
import Button from 'flarum/common/components/Button';

app.initializers.add('clarkwinkelmann-quiz-polls', () => {
    const {
        CreatePollModal,
        DiscussionPoll,
        EditPollModal,
    } = flarum.extensions['fof-polls'].components;

    extend(CreatePollModal.prototype, 'oninit', function () {
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
            if (this.correctAnswerIndex !== null) {
                poll.correctAnswer = this.options[this.correctAnswerIndex]();
            }

            originalSubmit(poll);
        };

        original(event);

        // Restore original in case the modal doesn't close and something else happens
        this.attrs.onsubmit = originalSubmit;
    });

    extend(EditPollModal.prototype, 'displayOptions', function (vdom) {
        this.options.forEach((option, index) => {
            // Because fof/pol create the record without any attribute, we need this line of code otherwise attribute() fails
            option.data.attributes = option.data.attributes || {};
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

        // If user has not voted, don't change anything else
        if (this.myVotes.length === 0) {
            return;
        }

        this.options.forEach((option, index) => {
            const isCorrectAnswer = option.attribute('correct');
            const isUserVote = this.myVotes.some((vote) => vote.option() === option);

            if (!isCorrectAnswer && !isUserVote) {
                return;
            }

            vdom.children[1].children[index].attrs.className += (isUserVote ? ' PollOption--own' : '') + (isCorrectAnswer ? ' PollOption--correct' : ' PollOption--wrong');
        });
    });
});
