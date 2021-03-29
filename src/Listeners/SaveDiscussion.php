<?php

namespace ClarkWinkelmann\QuizPolls\Listeners;

use ClarkWinkelmann\QuizPolls\Repositories\PollRepository;
use Flarum\Discussion\Discussion;
use Flarum\Discussion\Event\Saving;
use FoF\Polls\Poll;
use FoF\Polls\PollOption;
use Illuminate\Support\Arr;

class SaveDiscussion
{
    protected $repository;

    public function __construct(PollRepository $repository)
    {
        $this->repository = $repository;
    }

    public function handle(Saving $event)
    {
        // Because of the extension requirement, we know our code will run after fof/polls

        if ($event->discussion->exists || !isset($event->data['attributes']['poll'])) {
            return;
        }

        // Permissions are already checked by the polls listener

        $attributes = $event->data['attributes']['poll'];
        $options = Arr::get($attributes, 'relationships.options', []);

        $event->discussion->afterSave(function (Discussion $discussion) use ($options, $attributes, $event) {
            /**
             * @var $poll Poll
             */
            $poll = Poll::query()->where('discussion_id', $discussion->id)->firstOrFail();

            $map = [];

            foreach ($options as $answer) {
                /**
                 * @var $option PollOption
                 */
                $option = $poll->options()->where('answer', $answer)->first();

                if ($option) {
                    $map[$option->id] = Arr::get($attributes, 'correctAnswer') === $answer;
                }
            }

            $this->repository->updatePoll($poll, $map);
        });
    }
}
