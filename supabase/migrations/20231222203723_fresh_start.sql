-- Drop all existing tables and functions
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.time_entries CASCADE;
DROP TABLE IF EXISTS public.task_comments CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP FUNCTION IF EXISTS public.get_user_id_by_email CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT,
    full_name TEXT,
    user_metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create projects table
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create tasks table
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMPTZ,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES public.profiles(id),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create time entries table
CREATE TABLE public.time_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create task comments table
CREATE TABLE public.task_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_time_entries_task_id ON public.time_entries(task_id);
CREATE INDEX idx_time_entries_project_id ON public.time_entries(project_id);
CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX idx_task_comments_user_id ON public.task_comments(user_id);

-- Create handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, user_metadata)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TRIGGER projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER task_comments_updated_at
    BEFORE UPDATE ON public.task_comments
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.tasks TO authenticated;
GRANT ALL ON public.time_entries TO authenticated;
GRANT ALL ON public.task_comments TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.profiles IS 'User profiles with additional metadata';
COMMENT ON TABLE public.projects IS 'Projects that users can create and manage';
COMMENT ON TABLE public.tasks IS 'Tasks within projects that can be assigned to users';
COMMENT ON TABLE public.time_entries IS 'Time tracking entries for tasks';
COMMENT ON TABLE public.task_comments IS 'Comments on tasks';

-- Now add all policies after tables are created
-- Profiles policies
CREATE POLICY "profiles_select" ON public.profiles 
    FOR SELECT USING (true);

CREATE POLICY "profiles_update" ON public.profiles 
    FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "projects_select" ON public.projects 
    FOR SELECT USING (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.tasks 
            WHERE tasks.project_id = projects.id 
            AND tasks.assigned_to = auth.uid()
        )
    );

CREATE POLICY "projects_insert" ON public.projects 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects_update" ON public.projects 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "projects_delete" ON public.projects 
    FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "tasks_select" ON public.tasks 
    FOR SELECT USING (
        user_id = auth.uid()
        OR
        assigned_to = auth.uid()
    );

CREATE POLICY "tasks_insert" ON public.tasks 
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "tasks_update" ON public.tasks 
    FOR UPDATE USING (
        user_id = auth.uid()
        OR
        assigned_to = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "tasks_delete" ON public.tasks 
    FOR DELETE USING (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Time entries policies
CREATE POLICY "time_entries_select" ON public.time_entries 
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "time_entries_insert" ON public.time_entries 
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "time_entries_update" ON public.time_entries 
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "time_entries_delete" ON public.time_entries 
    FOR DELETE USING (user_id = auth.uid());

-- Task comments policies
CREATE POLICY "task_comments_select" ON public.task_comments 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tasks 
            WHERE tasks.id = task_id 
            AND (tasks.user_id = auth.uid() OR tasks.assigned_to = auth.uid())
        )
    );

CREATE POLICY "task_comments_insert" ON public.task_comments 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tasks 
            WHERE tasks.id = task_id 
            AND (tasks.user_id = auth.uid() OR tasks.assigned_to = auth.uid())
        )
    );

CREATE POLICY "task_comments_update" ON public.task_comments 
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "task_comments_delete" ON public.task_comments 
    FOR DELETE USING (user_id = auth.uid());
