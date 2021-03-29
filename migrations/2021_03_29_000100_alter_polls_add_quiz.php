<?php

use Flarum\Database\Migration;

return Migration::addColumns('polls', [
    'is_quiz' => ['boolean', 'default' => false],
]);
