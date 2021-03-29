<?php

namespace ClarkWinkelmann\QuizPolls;

use Flarum\Discussion\Event\Saving;
use Flarum\Extend;
use FoF\Polls\Api\Serializers\PollOptionSerializer;
use FoF\Polls\Api\Serializers\PollSerializer;
use FoF\Polls\Poll;
use FoF\Polls\PollOption;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/resources/less/forum.less'),

    new Extend\Locales(__DIR__ . '/resources/locale'),

    (new Extend\ServiceProvider())
        ->register(Providers\PipeThroughPollEdit::class),

    (new Extend\Event())
        ->listen(Saving::class, Listeners\SaveDiscussion::class),

    (new Extend\ApiSerializer(PollSerializer::class))
        ->attribute('isQuiz', function (PollSerializer $serializer, Poll $poll) {
            return (bool)$poll->is_quiz;
        }),

    (new Extend\ApiSerializer(PollOptionSerializer::class))
        ->attribute('correct', function (PollOptionSerializer $serializer, PollOption $option) {
            return (bool)$option->correct;
        }),
];
