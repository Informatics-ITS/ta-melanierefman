<?php

namespace Modules\Research\Services;

use Carbon\Carbon;
use Modules\Research\Models\Research;

class ResearchDateService
{
    public function formatDateForStorage(int $year, int $month, int $day = 1): string
    {
        return Carbon::createFromFormat('Y-m-d', "{$year}-{$month}-{$day}")->format('Y-m-d');
    }

    public function getResearchByDateRange(Carbon $startDate, Carbon $endDate)
    {
        return Research::whereBetween('start_date', [$startDate, $endDate])
            ->orWhereBetween('end_date', [$startDate, $endDate])
            ->get();
    }

    public function getActiveResearchAt(Carbon $date)
    {
        return Research::where('start_date', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('end_date')
                    ->orWhere('end_date', '>=', $date);
            })
            ->get();
    }

    public function getCurrentActiveResearch()
    {
        return $this->getActiveResearchAt(now());
    }

    public function getResearchDuration(Research $research): ?int
    {
        if (!$research->start_date || !$research->end_date) {
            return null;
        }

        return Carbon::parse($research->start_date)
            ->diffInDays(Carbon::parse($research->end_date));
    }
}
