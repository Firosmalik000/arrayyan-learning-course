<?php

use App\Models\Olympiad;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('olympiads', function (Blueprint $table): void {
            $table->string('slug')->nullable()->unique()->after('name');
            $table->softDeletes();
            $table->boolean('is_active')->default(true)->change();
        });

        // Generate slugs for existing records
        Olympiad::all()->each(function (Olympiad $olympiad): void {
            $olympiad->update(['slug' => Str::slug($olympiad->name)]);
        });
    }

    public function down(): void
    {
        Schema::table('olympiads', function (Blueprint $table): void {
            $table->dropColumn('slug');
            $table->dropSoftDeletes();
            $table->boolean('is_active')->default(false)->change();
        });
    }
};
