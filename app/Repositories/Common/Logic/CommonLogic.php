<?php
namespace App\Repositories\Common\Logic;

use App\Services\Api\KugouMusicApiSerivce;
use App\Helpers\CurlRequest;

class CommonLogic
{
    /**
     * 依据文件 hash 搜索酷狗的音乐播放地址
     * @return string
     */
    public static function memorabilia_bg()
    {
        $keyword = '刚好遇见你';
        $singer = '曲肖冰';
        $bg_url = KugouMusicApiSerivce::run($keyword, $singer);
        return $bg_url;
    }

}
