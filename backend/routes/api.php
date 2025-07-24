<?php

foreach (glob(base_path('app/Modules/*/routes/api.php')) as $routeFile) {
    require $routeFile;
}
