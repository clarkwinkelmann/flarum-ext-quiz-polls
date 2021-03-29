<?php

namespace ClarkWinkelmann\QuizPolls\Providers;

use ClarkWinkelmann\QuizPolls\Repositories\PollRepository;
use Flarum\Foundation\AbstractServiceProvider;
use FoF\Polls\Commands\EditPoll;
use FoF\Polls\Poll;
use FoF\Polls\PollOption;
use Illuminate\Contracts\Bus\Dispatcher;
use Illuminate\Support\Arr;

class PipeThroughPollEdit extends AbstractServiceProvider
{
    public function register()
    {
        $this->app->resolving(Dispatcher::class, function (Dispatcher $bus) {
            $bus->pipeThrough([
                function ($command, $next) {
                    $ret = $next($command);

                    if ($command instanceof EditPoll) {
                        $poll = Poll::findOrFail($command->pollId);

                        // Permissions have already been checked by the default handler

                        $attributes = Arr::get($command->data, 'attributes', []);

                        $options = collect(Arr::get($attributes, 'options', []));

                        $map = [];

                        foreach ($options as $opt) {
                            $id = Arr::get($opt, 'id');

                            // If it's a new answer, we need to find its ID in the database
                            if (!$id) {
                                /**
                                 * @var $option PollOption
                                 */
                                $option = $poll->options()->where('answer', Arr::get($opt, 'attributes.answer'))->first();

                                if ($option) {
                                    $id = $option->id;
                                }
                            }

                            $correct = Arr::get($opt, 'attributes.correct');

                            $map[$id] = $correct;
                        }

                        /**
                         * @var $repository PollRepository
                         */
                        $repository = $this->app->make(PollRepository::class);

                        $repository->updatePoll($poll, $map);
                    }

                    return $ret;
                },
            ]);
        });
    }
}
