import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

        // Admin client para todas operacoes privilegiadas (bypassa RLS)
        const adminClient = createClient(supabaseUrl, serviceRoleKey);

        // Identifica o usuario chamador pelo token JWT
        const callerClient = createClient(supabaseUrl, anonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        const { data: { user: callerUser }, error: userError } = await callerClient.auth.getUser();
        if (userError || !callerUser) {
            return new Response(JSON.stringify({ error: 'Token invalido ou expirado.' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Busca o perfil do chamador usando admin client (sem restricao RLS)
        const { data: callerProfile } = await adminClient
            .from('user_profiles')
            .select('role')
            .eq('id', callerUser.id)
            .single();

        if (!callerProfile || callerProfile.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Somente administradores podem criar usuarios.' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Dados do novo usuario
        const body = await req.json();
        const { email, password, fullName, unitName, role } = body;

        if (!email || !password || !fullName || !role) {
            return new Response(JSON.stringify({ error: 'Preencha todos os campos obrigatorios.' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Para professor, unidade e obrigatoria
        if (role === 'professor' && !unitName) {
            return new Response(JSON.stringify({ error: 'Selecione uma unidade para o professor.' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (password.length < 6) {
            return new Response(JSON.stringify({ error: 'A senha deve ter pelo menos 6 caracteres.' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const finalUnit = role === 'admin' ? 'all' : unitName;

        // Cria o usuario via Admin API
        // Passa os metadados corretos para o trigger handle_new_user
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName, unit_name: finalUnit, role },
        });

        if (createError) {
            let msg = 'Erro ao criar usuario.';
            if (createError.message.includes('already registered') || createError.message.includes('already been registered')) {
                msg = 'Este e-mail ja esta cadastrado.';
            } else if (createError.message.includes('invalid')) {
                msg = 'E-mail invalido.';
            } else {
                msg = createError.message;
            }
            return new Response(JSON.stringify({ error: msg }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Garante que o perfil esta correto (sobrescreve o que o trigger criou)
        const { error: profileError } = await adminClient.from('user_profiles').upsert({
            id: newUser.user!.id,
            full_name: fullName,
            email,
            unit_name: finalUnit,
            role,
        }, { onConflict: 'id' });

        if (profileError) {
            console.error('Erro ao criar perfil:', profileError);
            // Usuario foi criado, mas o perfil falhou - retorna sucesso parcial
            return new Response(
                JSON.stringify({ success: true, userId: newUser.user!.id, warning: 'Perfil criado parcialmente.' }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ success: true, userId: newUser.user!.id }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (err: any) {
        console.error('Unexpected error:', err);
        return new Response(
            JSON.stringify({ error: err.message || 'Erro interno no servidor.' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
