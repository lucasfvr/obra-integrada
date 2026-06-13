---
tags: [postgresql, neon, function, cadastro, global]
---
# 📜 PG-001: Function - Criação de Usuário (Identidade Global)

Função PL/pgSQL para criar a conta base do usuário no ecossistema Obra Integrada, garantindo a unicidade do CPF.

## Código SQL

```postgresql
CREATE OR REPLACE FUNCTION global.fn_criar_usuario_global(
    p_cpf VARCHAR(14),
    p_nome_completo VARCHAR(150),
    p_email VARCHAR(100) DEFAULT NULL,
    p_hash_senha VARCHAR(256) DEFAULT NULL,
    p_is_terceirizado BOOLEAN DEFAULT FALSE
) RETURNS INTEGER AS $$
DECLARE
    v_novo_id INTEGER;
BEGIN
    -- 1. Validação: Bloqueio de CPF duplicado
    IF EXISTS (SELECT 1 FROM global.usuario WHERE cpf = p_cpf) THEN
        RAISE EXCEPTION 'Erro 50004: Já existe um usuário cadastrado com este CPF no ecossistema.';
    END IF;

    -- 2. Validação: Bloqueio de E-mail duplicado (se fornecido)
    IF p_email IS NOT NULL AND EXISTS (SELECT 1 FROM global.usuario WHERE email = p_email) THEN
        RAISE EXCEPTION 'Erro 50005: Este e-mail já está sendo utilizado por outra conta.';
    END IF;

    -- 3. Inserção com retorno imediato do ID gerado
    INSERT INTO global.usuario (
        cpf, 
        nome_completo, 
        email, 
        hash_senha, 
        is_terceirizado
    )
    VALUES (
        p_cpf, 
        p_nome_completo, 
        p_email, 
        p_hash_senha, 
        p_is_terceirizado
    )
    RETURNING id INTO v_novo_id;

    -- Retorna o ID para o Backend (Node.js)
    RETURN v_novo_id;
END;
$$ LANGUAGE plpgsql;