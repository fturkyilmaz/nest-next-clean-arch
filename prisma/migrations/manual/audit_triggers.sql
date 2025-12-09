-- Migration: Add Audit Trail Trigger
-- This trigger automatically logs changes to auditable tables

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    changes JSONB;
    current_user_id TEXT;
BEGIN
    -- Get current user from session variable (set by application)
    current_user_id := current_setting('app.current_user_id', true);
    
    IF TG_OP = 'INSERT' THEN
        new_data := to_jsonb(NEW);
        
        INSERT INTO audit_logs (
            id,
            user_id,
            action,
            entity,
            entity_id,
            changes,
            metadata,
            created_at
        ) VALUES (
            gen_random_uuid()::text,
            current_user_id,
            'CREATE',
            TG_TABLE_NAME,
            NEW.id,
            new_data::text,
            jsonb_build_object('table', TG_TABLE_NAME, 'operation', TG_OP)::text,
            NOW()
        );
        
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        
        -- Calculate differences
        changes := jsonb_build_object(
            'before', old_data,
            'after', new_data
        );
        
        INSERT INTO audit_logs (
            id,
            user_id,
            action,
            entity,
            entity_id,
            changes,
            metadata,
            created_at
        ) VALUES (
            gen_random_uuid()::text,
            current_user_id,
            'UPDATE',
            TG_TABLE_NAME,
            NEW.id,
            changes::text,
            jsonb_build_object('table', TG_TABLE_NAME, 'operation', TG_OP)::text,
            NOW()
        );
        
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        
        INSERT INTO audit_logs (
            id,
            user_id,
            action,
            entity,
            entity_id,
            changes,
            metadata,
            created_at
        ) VALUES (
            gen_random_uuid()::text,
            current_user_id,
            'DELETE',
            TG_TABLE_NAME,
            OLD.id,
            old_data::text,
            jsonb_build_object('table', TG_TABLE_NAME, 'operation', TG_OP)::text,
            NOW()
        );
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auditable tables
DROP TRIGGER IF EXISTS audit_users_trigger ON users;
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_clients_trigger ON clients;
CREATE TRIGGER audit_clients_trigger
    AFTER INSERT OR UPDATE OR DELETE ON clients
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_diet_plans_trigger ON diet_plans;
CREATE TRIGGER audit_diet_plans_trigger
    AFTER INSERT OR UPDATE OR DELETE ON diet_plans
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_appointments_trigger ON appointments;
CREATE TRIGGER audit_appointments_trigger
    AFTER INSERT OR UPDATE OR DELETE ON appointments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Add comment for documentation
COMMENT ON FUNCTION audit_trigger_function() IS 
'Automatic audit trail trigger that logs all changes to users, clients, diet_plans, and appointments tables.
The current user ID should be set via: SET LOCAL app.current_user_id = ''user-id'';';
