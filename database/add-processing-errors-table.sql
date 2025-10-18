-- RSS Feed Processing Errors Table
-- Tracks errors that occur during RSS feed fetching and processing

CREATE TYPE error_severity AS ENUM ('info', 'warning', 'error', 'critical');
CREATE TYPE processing_stage AS ENUM ('fetch', 'parse', 'validate', 'store');

CREATE TABLE rss_processing_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider cloud_provider NOT NULL,
    error_stage processing_stage NOT NULL,
    error_severity error_severity NOT NULL DEFAULT 'error',
    error_message TEXT NOT NULL,
    error_details JSONB,
    feed_url TEXT,
    http_status_code INTEGER,
    affected_regions TEXT[],
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,

    CONSTRAINT check_resolved_after_occurred CHECK (resolved_at IS NULL OR resolved_at >= occurred_at)
);

-- Create indexes for efficient querying
CREATE INDEX idx_rss_errors_provider ON rss_processing_errors (provider);
CREATE INDEX idx_rss_errors_occurred_at ON rss_processing_errors (occurred_at DESC);
CREATE INDEX idx_rss_errors_severity ON rss_processing_errors (error_severity);
CREATE INDEX idx_rss_errors_unresolved ON rss_processing_errors (occurred_at DESC) WHERE resolved_at IS NULL;

-- Enable Row Level Security
ALTER TABLE rss_processing_errors ENABLE ROW LEVEL SECURITY;

-- Public read access for error transparency
CREATE POLICY "Allow public read access to rss_processing_errors" ON rss_processing_errors
    FOR SELECT USING (true);

-- Service role can manage errors
CREATE POLICY "Allow service role to manage rss_processing_errors" ON rss_processing_errors
    FOR ALL USING (auth.role() = 'service_role');

-- View for recent unresolved errors
CREATE VIEW recent_processing_errors AS
SELECT
    provider,
    error_stage,
    error_severity,
    error_message,
    error_details,
    feed_url,
    http_status_code,
    affected_regions,
    occurred_at,
    resolved_at
FROM rss_processing_errors
WHERE resolved_at IS NULL
   OR occurred_at >= NOW() - INTERVAL '24 hours'
ORDER BY occurred_at DESC;

-- Grant permissions
GRANT SELECT ON recent_processing_errors TO anon, authenticated;

-- Helper function to log processing errors
CREATE OR REPLACE FUNCTION log_processing_error(
    p_provider cloud_provider,
    p_stage processing_stage,
    p_severity error_severity,
    p_message TEXT,
    p_details JSONB DEFAULT NULL,
    p_feed_url TEXT DEFAULT NULL,
    p_http_status INTEGER DEFAULT NULL,
    p_affected_regions TEXT[] DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_error_id UUID;
BEGIN
    INSERT INTO rss_processing_errors (
        provider, error_stage, error_severity, error_message,
        error_details, feed_url, http_status_code, affected_regions
    ) VALUES (
        p_provider, p_stage, p_severity, p_message,
        p_details, p_feed_url, p_http_status, p_affected_regions
    )
    RETURNING id INTO v_error_id;

    RETURN v_error_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to resolve errors
CREATE OR REPLACE FUNCTION resolve_processing_error(p_error_id UUID) RETURNS VOID AS $$
BEGIN
    UPDATE rss_processing_errors
    SET resolved_at = NOW()
    WHERE id = p_error_id AND resolved_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample error data for testing
INSERT INTO rss_processing_errors (provider, error_stage, error_severity, error_message, feed_url, http_status_code, occurred_at) VALUES
('aws', 'fetch', 'warning', 'Slow response time from RSS feed', 'https://status.aws.amazon.com/rss/all.rss', 200, NOW() - INTERVAL '2 hours'),
('azure', 'parse', 'error', 'Invalid XML format in feed response', 'https://status.azure.com/en-us/status/feed/', NULL, NOW() - INTERVAL '30 minutes');
