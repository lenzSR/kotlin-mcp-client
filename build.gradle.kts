plugins {
    kotlin("jvm") version "2.1.0"
    kotlin("plugin.serialization") version "2.1.0" // 添加序列化插件
    application
}

group = "org.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    implementation("io.modelcontextprotocol:kotlin-sdk:0.4.0")
//    implementation("org.jetbrains.kotlinx:kotlinx-serialization-core:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
    implementation("org.reflections:reflections:0.10.2")

    implementation("io.ktor:ktor-server-netty:3.0.2")   // 根据Kotlin版本选择合适Ktor版本
    implementation("io.ktor:ktor-server-core:3.0.2")
    implementation("io.ktor:ktor-server-call-logging:2.3.7")
    implementation("io.ktor:ktor-server-content-negotiation:3.0.2")
    implementation("ch.qos.logback:logback-classic:1.5.13")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("io.ktor:ktor-serialization-gson:3.0.2")
    implementation("io.ktor:ktor-serialization-jackson:3.0.2")
    implementation("io.ktor:ktor-server-cors:3.0.2")
    implementation("io.ktor:ktor-server-forwarded-header:3.0.2") // OkHttp 最新稳定版

    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
}

kotlin {
    jvmToolchain(17)
}

application {
    mainClass.set("org.example.MainKt") // 注意：Main.kt 对应的 class 是 MainKt
}

tasks.jar {
    manifest {
        attributes["Main-Class"] = "org.example.MainKt"
    }

    // 把所有依赖一起打进 JAR（可选）
    from({
        configurations.runtimeClasspath.get().map { if (it.isDirectory) it else zipTree(it) }
    })
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
}