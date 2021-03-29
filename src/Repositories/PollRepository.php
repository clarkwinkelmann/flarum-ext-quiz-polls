<?php

namespace ClarkWinkelmann\QuizPolls\Repositories;

use FoF\Polls\Poll;

class PollRepository
{
    public function updatePoll(Poll $poll, array $options)
    {
        $isQuiz = false;

        foreach ($options as $id => $correct) {
            $poll->options()->where([
                'id' => $id,
            ])->update([
                'correct' => $correct,
            ]);

            if ($correct) {
                $isQuiz = true;
            }
        }

        $poll->is_quiz = $isQuiz;
        $poll->save();
    }
}
