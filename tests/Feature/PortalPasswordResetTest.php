<?php

namespace Tests\Feature;

use App\Models\PortalAccount;
use App\Notifications\PortalResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PortalPasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_reset_pages_are_available(): void
    {
        $this->get(route('portal.password.request'))
            ->assertSuccessful()
            ->assertInertia(fn ($page) => $page->component('Auth/ForgotPassword', false));

        $this->get(route('portal.password.reset', [
            'token' => 'example-token',
            'email' => 'parent@example.com',
        ]))
            ->assertSuccessful()
            ->assertInertia(fn ($page) => $page
                ->component('Auth/ResetPassword', false)
                ->where('token', 'example-token')
                ->where('email', 'parent@example.com')
            );
    }

    public function test_portal_account_can_request_a_password_reset_link(): void
    {
        Notification::fake();

        $account = $this->makeAccount();

        $response = $this->post(route('portal.password.email'), [
            'email' => 'parent@example.com',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('status');

        Notification::assertSentTo(
            $account,
            PortalResetPasswordNotification::class,
            fn (PortalResetPasswordNotification $notification): bool => Password::broker('portal_accounts')
                ->tokenExists($account, $notification->token)
        );
    }

    public function test_unknown_email_receives_the_same_generic_response(): void
    {
        Notification::fake();

        $response = $this->post(route('portal.password.email'), [
            'email' => 'unknown@example.com',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('status');
        Notification::assertNothingSent();
    }

    public function test_portal_account_can_reset_its_password_with_a_valid_token(): void
    {
        $account = $this->makeAccount(['must_change_password' => true]);
        $token = Password::broker('portal_accounts')->createToken($account);

        $response = $this->post(route('portal.password.reset.update'), [
            'token' => $token,
            'email' => $account->email,
            'password' => 'kata-sandi-baru',
            'password_confirmation' => 'kata-sandi-baru',
        ]);

        $response->assertRedirect(route('login'));
        $response->assertSessionHas('success');

        $account->refresh();

        $this->assertTrue(Hash::check('kata-sandi-baru', $account->password));
        $this->assertFalse($account->must_change_password);
        $this->assertFalse(Password::broker('portal_accounts')->tokenExists($account, $token));
    }

    public function test_invalid_token_does_not_change_the_password(): void
    {
        $account = $this->makeAccount();

        $response = $this->from(route('portal.password.reset', ['token' => 'invalid-token']))
            ->post(route('portal.password.reset.update'), [
                'token' => 'invalid-token',
                'email' => $account->email,
                'password' => 'kata-sandi-baru',
                'password_confirmation' => 'kata-sandi-baru',
            ]);

        $response->assertRedirect(route('portal.password.reset', ['token' => 'invalid-token']));
        $response->assertSessionHasErrors('email');
        $this->assertTrue(Hash::check('password-lama', $account->fresh()->password));
    }

    public function test_inactive_portal_account_does_not_receive_a_reset_link(): void
    {
        Notification::fake();

        $this->makeAccount(['is_active' => false]);

        $response = $this->post(route('portal.password.email'), [
            'email' => 'parent@example.com',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('status');
        Notification::assertNothingSent();
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function makeAccount(array $overrides = []): PortalAccount
    {
        return PortalAccount::create(array_merge([
            'type' => PortalAccount::TYPE_PARENT,
            'name' => 'Orang Tua Test',
            'email' => 'parent@example.com',
            'contact' => '081234567890',
            'password' => Hash::make('password-lama'),
            'must_change_password' => false,
            'is_active' => true,
        ], $overrides));
    }
}
