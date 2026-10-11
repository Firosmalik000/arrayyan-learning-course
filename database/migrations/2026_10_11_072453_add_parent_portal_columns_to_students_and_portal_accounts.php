<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('portal_accounts')) {
            Schema::table('portal_accounts', function (Blueprint $table): void {
                if (! Schema::hasColumn('portal_accounts', 'email')) {
                    $table->string('email')->nullable()->after('contact')->index();
                }
            });
        }

        if (Schema::hasTable('students')) {
            Schema::table('students', function (Blueprint $table): void {
                if (! Schema::hasColumn('students', 'parent_email')) {
                    $table->string('parent_email')->nullable()->after('parent_contact');
                }
                if (! Schema::hasColumn('students', 'parent_portal_account_id')) {
                    $table->foreignId('parent_portal_account_id')
                        ->nullable()
                        ->after('parent_email')
                        ->constrained('portal_accounts')
                        ->nullOnDelete();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('students')) {
            Schema::table('students', function (Blueprint $table): void {
                if (Schema::hasColumn('students', 'parent_portal_account_id')) {
                    $table->dropForeign(['parent_portal_account_id']);
                    $table->dropColumn('parent_portal_account_id');
                }
                if (Schema::hasColumn('students', 'parent_email')) {
                    $table->dropColumn('parent_email');
                }
            });
        }

        if (Schema::hasTable('portal_accounts')) {
            Schema::table('portal_accounts', function (Blueprint $table): void {
                if (Schema::hasColumn('portal_accounts', 'email')) {
                    $table->dropIndex(['email']);
                    $table->dropColumn('email');
                }
            });
        }
    }
};
