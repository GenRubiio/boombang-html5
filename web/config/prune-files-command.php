<?php

return [
    /*
     * Disks to prune old files and time to calculate since posix
     * Key is a filesystem and value is a time from options: 'hour', 'day', 'yesterday', 'week', 'month', 'year'
     */
    'disks' => [
        'backups' => 'month',
    ],
];
