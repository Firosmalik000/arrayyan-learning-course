<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('programs', function (Blueprint $table): void {
            $table->string('slug', 255)->nullable()->unique()->after('id');
            $table->decimal('price', 12, 2)->nullable()->after('description');
            $table->string('duration', 100)->nullable()->after('price');
            $table->unsignedInteger('quota')->nullable()->after('duration');
            $table->text('schedule_info')->nullable()->after('quota');
            $table->json('syllabus')->nullable()->after('schedule_info');
            $table->foreignId('teacher_id')->nullable()->after('syllabus')
                ->constrained('teachers')->nullOnDelete();
            $table->boolean('is_featured')->default(false)->after('is_active');
        });

        Schema::table('packages', function (Blueprint $table): void {
            $table->string('slug', 255)->nullable()->unique()->after('id');
            $table->decimal('price', 12, 2)->nullable()->after('name');
            $table->string('duration', 100)->nullable()->after('price');
            $table->unsignedInteger('quota')->nullable()->after('duration');
            $table->text('schedule_info')->nullable()->after('quota');
            $table->json('syllabus')->nullable()->after('schedule_info');
            $table->boolean('is_featured')->default(false)->after('is_active');
        });

        $this->backfillSlugs('programs');
        $this->backfillSlugs('packages');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table): void {
            $table->dropForeign(['teacher_id']);
            $table->dropUnique(['slug']);
            $table->dropColumn([
                'slug', 'price', 'duration', 'quota', 'schedule_info',
                'syllabus', 'teacher_id', 'is_featured',
            ]);
        });

        Schema::table('packages', function (Blueprint $table): void {
            $table->dropUnique(['slug']);
            $table->dropColumn([
                'slug', 'price', 'duration', 'quota', 'schedule_info',
                'syllabus', 'is_featured',
            ]);
        });
    }

    private function backfillSlugs(string $table): void
    {
        DB::table($table)
            ->whereNull('slug')
            ->orderBy('id')
            ->eachById(function (object $row) use ($table): void {
                $base = Str::slug((string) ($row->name ?? 'item'));
                $slug = $base !== '' ? $base : 'item';

                $exists = DB::table($table)->where('slug', $slug)->exists();
                if ($exists) {
                    $slug .= '-'.$row->id;
                }

                DB::table($table)->where('id', $row->id)->update(['slug' => $slug]);
            });
    }
};
