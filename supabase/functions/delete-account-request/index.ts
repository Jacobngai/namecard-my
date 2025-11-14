// Delete Account Request Edge Function for WhatsCard
// Handles user account deletion requests from whatscard.app/delete-account

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface DeleteAccountRequest {
  email: string;
  reason?: string;
  feedback?: string;
  requestedAt: string;
}

serve(async (req) => {
  // CORS headers for website integration
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData: DeleteAccountRequest = await req.json();
    const { email, reason, feedback, requestedAt } = requestData;

    // Validate email
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role (admin access)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, tier')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.log('❌ User not found:', email);
      // Don't reveal if email exists (privacy)
      return new Response(
        JSON.stringify({
          success: true,
          message: 'If this email is registered, you will receive a confirmation email shortly.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User found:', user.id);

    // Calculate deletion date (30 days from now)
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    // Create deletion request record
    const { data: deletionRequest, error: insertError } = await supabase
      .from('deletion_requests')
      .insert({
        user_id: user.id,
        email: user.email,
        reason: reason || null,
        feedback: feedback || null,
        requested_at: requestedAt,
        scheduled_deletion_date: deletionDate.toISOString(),
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating deletion request:', insertError);
      throw new Error('Failed to create deletion request');
    }

    console.log('✅ Deletion request created:', deletionRequest.id);

    // TODO: Send confirmation email
    // You can integrate with SendGrid, Resend, or other email service
    console.log('📧 TODO: Send confirmation email to:', email);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account deletion request submitted successfully',
        deletionDate: deletionDate.toISOString(),
        requestId: deletionRequest.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process deletion request',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
