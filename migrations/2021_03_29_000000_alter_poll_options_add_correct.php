<?php

use Flarum\Database\Migration;

return Migration::addColumns('poll_options', [
    'correct' => ['boolean', 'default' => false],
]);
