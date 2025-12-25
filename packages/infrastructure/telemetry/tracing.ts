import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import {
  BatchSpanProcessor,
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from "@opentelemetry/sdk-trace-base";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { NestInstrumentation } from "@opentelemetry/instrumentation-nestjs-core";
import { PrismaInstrumentation } from "@prisma/instrumentation";
import {
  trace,
  context,
  SpanStatusCode,
  Span,
  Tracer,
} from "@opentelemetry/api";
import { detectResources } from "@opentelemetry/resources";


/**
 * OpenTelemetry Configuration
 */
export interface TelemetryConfig {
  serviceName: string;
  serviceVersion: string;
  environment: string;
  otlpEndpoint?: string;
  enabled: boolean;
  consoleExporter?: boolean;
}

const defaultConfig: TelemetryConfig = {
  serviceName: "diet-management-api",
  serviceVersion: process.env.npm_package_version || "1.0.0",
  environment: process.env.NODE_ENV || "development",
  otlpEndpoint:
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
    "http://localhost:4318/v1/traces",
  enabled: process.env.OTEL_ENABLED !== "false",
  consoleExporter: process.env.NODE_ENV === "development",
};

let sdk: NodeSDK | null = null;

/**
 * Initialize OpenTelemetry SDK
 * Call this BEFORE importing other modules in main.ts
 */
export async function initTelemetry(
  config: Partial<TelemetryConfig> = {}
): Promise<void> {
  const finalConfig = { ...defaultConfig, ...config };

  if (!finalConfig.enabled) {
    console.log("📊 OpenTelemetry disabled");
    return;
  }
  const resource = await detectResources();


  const exporters = [];

  if (finalConfig.otlpEndpoint) {
    const otlpExporter = new OTLPTraceExporter({
      url: finalConfig.otlpEndpoint,
    });
    exporters.push(new BatchSpanProcessor(otlpExporter));
  }

  if (finalConfig.consoleExporter) {
    exporters.push(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  }

  sdk = new NodeSDK({
    spanProcessors: exporters,
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": { enabled: false },
      }),
      new HttpInstrumentation({
        ignoreIncomingPaths: ["/health", "/metrics", "/api/v1/health"],
      }),
      new ExpressInstrumentation(),
      new NestInstrumentation(),
      new PrismaInstrumentation(),
    ],
  });

  await sdk.start();
  console.log(
    `📊 OpenTelemetry v2 initialized - Service: ${finalConfig.serviceName}`
  );

  process.on("SIGTERM", () => {
    sdk
      ?.shutdown()
      .then(() => console.log("OpenTelemetry shut down"))
      .catch((err) => console.error("Error shutting down OpenTelemetry", err));
  });
}

/**
 * Shutdown OpenTelemetry SDK
 */
export async function shutdownTelemetry(): Promise<void> {
  if (sdk) {
    await sdk.shutdown();
    sdk = null;
  }
}

/**
 * Get the global tracer
 */
export function getTracer(name: string = "diet-api"): Tracer {
  return trace.getTracer(name);
}

/**
 * Create a new span for custom tracing
 */
export async function createSpan(
  name: string,
  fn: (span: Span) => Promise<void> | void,
  attributes?: Record<string, string | number | boolean>
): Promise<void> {
  const tracer = getTracer();
  return tracer.startActiveSpan(name, async (span) => {
    try {
      if (attributes) {
        span.setAttributes(attributes);
      }
      await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Add attributes to the current active span
 */
export function addSpanAttributes(
  attributes: Record<string, string | number | boolean>
): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.setAttributes(attributes);
  }
}

/**
 * Record an event on the current active span
 */
export function addSpanEvent(
  name: string,
  attributes?: Record<string, string | number | boolean>
): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.addEvent(name, attributes);
  }
}

/**
 * Get the current trace ID for correlation
 */
export function getCurrentTraceId(): string | undefined {
  const span = trace.getActiveSpan();
  return span?.spanContext().traceId;
}

/**
 * Get the current span ID
 */
export function getCurrentSpanId(): string | undefined {
  const span = trace.getActiveSpan();
  return span?.spanContext().spanId;
}

// Re-export commonly used types
export { trace, context, SpanStatusCode, Span, Tracer };
