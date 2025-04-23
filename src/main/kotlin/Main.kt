package org.example

import com.fasterxml.jackson.databind.SerializationFeature
import io.ktor.http.*
import io.ktor.serialization.jackson.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.http.content.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.forwardedheaders.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.example.util.MockUtil

fun main() {
    embeddedServer(Netty, port = 8082) {
        install(ForwardedHeaders) // WARNING: for security, do not include this if not behind a reverse proxy
        install(XForwardedHeaders) // WARNING: for security, do not include this if not behind a reverse proxy

        install(ContentNegotiation) {
            jackson {
                enable(SerializationFeature.INDENT_OUTPUT)
            }
        }

        routing {
            staticResources("/", "static") // 第一个参数是访问路径，第二个是资源文件夹名

            install(CORS) {
                allowMethod(HttpMethod.Options)
                allowMethod(HttpMethod.Put)
                allowMethod(HttpMethod.Delete)
                allowMethod(HttpMethod.Patch)
                allowHeader(HttpHeaders.Authorization)
                allowHeader("X-Session-ID")
                anyHost() // @TODO: Don't do this in production if possible. Try to limit it.
            }

            get("/mcp/chat-stream") {
                val message = call.request.queryParameters["message"] ?: return@get call.respondText(
                    "Missing 'message' parameter", status = HttpStatusCode.BadRequest
                )

                val sessionId = call.request.headers["X-Session-ID"]   // 自定义头
                println("session id: $sessionId")

                call.respondTextWriter(contentType = ContentType.Text.EventStream) {
                    try {
                        // 模拟MCP + LLM对话，若需要使用MCPClient，请准备自己的SSE MCP服务器和DeepSeek API KEY，并取消注释以下代码
//                        val resultFlow = MCPConnectionManager.getClient().executeConversation(message)
                        val resultFlow = MockUtil.send()

                        resultFlow.collect { part ->
                            withContext(Dispatchers.IO) {
//                                println(part)
                                write("data: $part\n\n")
                                flush()
                            }
                        }

                        // 添加结束标记
                        write("event: end\ndata: {}\n\n")
                        flush()
                    } catch (e: Exception) {
                        write("event: error\ndata: ${e.message ?: "Unknown error"}\n\n")
                        flush()
                    } finally {
                        // 确保连接关闭
                        close()
                    }
                }
            }

            // 健康检查端点
            get("/health") {
                call.respondText("Hello, MCP!")
            }
        }
    }.start(wait = true)
}