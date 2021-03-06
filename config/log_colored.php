<?php
/**
 * 带颜色的日志输出
 */
return [
    'switch'    => true, // Boolean  关 => false 开 => true
    'level'     => 1, // 该日志等级及以上，可以写入日志中  1~4 依次为 debug info warn error
    'time_zone' => 'Asia/Chongqing', // 时区
    'path'      => env('LOG_PATH', '/data/logs/app/blog'), // 日志存放路径
    'log_name'  => env('LOG_NAME', 'laravel'),
    'overdue'   => 30, // 日志过期时间，单位天
    'suffix'    => '.log', // 日志文件名后缀
];
