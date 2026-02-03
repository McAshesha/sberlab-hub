package org.acme.service;

import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Named;
import jakarta.inject.Singleton;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

/**
 * Provides a bounded virtual thread executor for parallel I/O operations.
 * Uses a semaphore to limit concurrent tasks, preventing resource exhaustion.
 */
@ApplicationScoped
public class VirtualThreadExecutor {

    private static final int MAX_CONCURRENT_TASKS = 100;
    private static final Semaphore SEMAPHORE = new Semaphore(MAX_CONCURRENT_TASKS);

    private final ExecutorService executor = Executors.newThreadPerTaskExecutor(
            Thread.ofVirtual()
                    .name("vt-worker-", 0)
                    .factory()
    );

    @Produces
    @Singleton
    @Named("virtualExecutor")
    public ExecutorService virtualExecutor() {
        return new BoundedVirtualExecutor(executor, SEMAPHORE);
    }

    @PreDestroy
    void shutdown() {
        executor.shutdown();
        try {
            if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }

    /**
     * Wrapper that enforces concurrency limits via semaphore.
     */
    private static class BoundedVirtualExecutor implements ExecutorService {
        private final ExecutorService delegate;
        private final Semaphore semaphore;

        BoundedVirtualExecutor(ExecutorService delegate, Semaphore semaphore) {
            this.delegate = delegate;
            this.semaphore = semaphore;
        }

        @Override
        public void execute(Runnable command) {
            delegate.execute(() -> {
                try {
                    semaphore.acquire();
                    try {
                        command.run();
                    } finally {
                        semaphore.release();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }

        // Delegate all other methods
        @Override public void shutdown() { delegate.shutdown(); }
        @Override public java.util.List<Runnable> shutdownNow() { return delegate.shutdownNow(); }
        @Override public boolean isShutdown() { return delegate.isShutdown(); }
        @Override public boolean isTerminated() { return delegate.isTerminated(); }
        @Override public boolean awaitTermination(long timeout, TimeUnit unit) throws InterruptedException {
            return delegate.awaitTermination(timeout, unit);
        }
        @Override public <T> java.util.concurrent.Future<T> submit(java.util.concurrent.Callable<T> task) {
            return delegate.submit(() -> {
                try {
                    semaphore.acquire();
                    try { return task.call(); }
                    finally { semaphore.release(); }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Task interrupted", e);
                }
            });
        }
        @Override public <T> java.util.concurrent.Future<T> submit(Runnable task, T result) {
            return delegate.submit(() -> {
                try {
                    semaphore.acquire();
                    try { task.run(); }
                    finally { semaphore.release(); }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }, result);
        }
        @Override public java.util.concurrent.Future<?> submit(Runnable task) {
            return delegate.submit(() -> {
                try {
                    semaphore.acquire();
                    try { task.run(); }
                    finally { semaphore.release(); }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }
        @Override public <T> java.util.List<java.util.concurrent.Future<T>> invokeAll(
                java.util.Collection<? extends java.util.concurrent.Callable<T>> tasks) throws InterruptedException {
            return delegate.invokeAll(tasks);
        }
        @Override public <T> java.util.List<java.util.concurrent.Future<T>> invokeAll(
                java.util.Collection<? extends java.util.concurrent.Callable<T>> tasks,
                long timeout, TimeUnit unit) throws InterruptedException {
            return delegate.invokeAll(tasks, timeout, unit);
        }
        @Override public <T> T invokeAny(java.util.Collection<? extends java.util.concurrent.Callable<T>> tasks)
                throws InterruptedException, java.util.concurrent.ExecutionException {
            return delegate.invokeAny(tasks);
        }
        @Override public <T> T invokeAny(java.util.Collection<? extends java.util.concurrent.Callable<T>> tasks,
                long timeout, TimeUnit unit) throws InterruptedException, java.util.concurrent.ExecutionException,
                java.util.concurrent.TimeoutException {
            return delegate.invokeAny(tasks, timeout, unit);
        }
    }
}
