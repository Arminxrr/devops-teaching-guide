---
description: จะบอกที่การต่อสายเเล้วการใช้งาน
---

# ESP 32 dhtt 11

VCC เข้ากับ 5V ของ ESP 32 out เข้าไปที่ D16 ตามโค้ดที่เราเขียนไว้ GND ที่ dhtt ลงไปที่ GND ของ ESP 32

<div align="left"><figure><img src="../.gitbook/assets/Screenshot 2026-01-17 123249.png" alt=""><figcaption></figcaption></figure></div>

ให้เราติดตั้ง Mosquitto MQTT ติดตั้งเสร็จให้เราเข้า Terminal เเล้วพิมพ์คำสั่ง&#x20;

```shellscript
ipconfig #ก็จะได้ ip ของเครื่องมา
Wireless LAN adapter Wi-Fi:

   Connection-specific DNS Suffix  . :
   IPv6 Address. . . . . . . . . . . : 
   Temporary IPv6 Address. . . . . . : 
   Link-local IPv6 Address . . . . . :
   IPv4 Address. . . . . . . . . . . : 192.168.1.xxx
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 
                                       192.168.1.1
```

ให้เราเข้าไปที่ arduino ide ติดตั้ง library ให้ครบ เลือก port ปรับให้ตรงกับบอร์ดที่เราใช้เเล้วใช้ wifi กับ ip MQTT

```javascript
#include <WiFi.h>          // เรียกใช้ไลบรารี WiFi ของ ESP32 เพื่อเชื่อมต่อเครือข่ายไร้สาย
#include <PubSubClient.h>  // ไลบรารี MQTT (Client) สำหรับ publish/subscribe ผ่าน MQTT broker (เช่น Mosquitto)
#include <DHT.h>           // ไลบรารีสำหรับอ่านค่าเซนเซอร์ DHT (DHT11/DHT22)

// ---- ตั้งค่าขาและชนิดเซนเซอร์ ----
#define DHTPIN 16          // กำหนดขา GPIO ที่ต่อ DATA ของ DHT11 (ที่นี่ใช้ขา 16)
#define DHTTYPE DHT11      // กำหนดชนิดเซนเซอร์เป็น DHT11 (ถ้าเป็น DHT22 ต้องเปลี่ยนเป็น DHT22)

// ---- ตั้งค่า Wi-Fi ----
const char* WIFI_SSID = "Anucha_2.4GHz"; // ชื่อ Wi-Fi ที่จะเชื่อมต่อ
const char* WIFI_PASS = "0929215194";    // รหัสผ่าน Wi-Fi (แนะนำอย่าแชร์สาธารณะ)

// ---- ตั้งค่า MQTT ----
const char* MQTT_HOST = "192.168.1.145"; // IP/Host ของ MQTT Broker (เครื่องที่รัน Mosquitto)
const int   MQTT_PORT = 1883;            // Port ของ MQTT ปกติคือ 1883
const char* MQTT_TOPIC = "sensors/pond"; // Topic ที่จะ publish ข้อมูลไป

// ---- สร้างออบเจกต์สำหรับการเชื่อมต่อ ----
WiFiClient espClient;              // สร้าง TCP client (เป็นพื้นฐานให้ MQTT ใช้ส่งข้อมูลผ่านเครือข่าย)
PubSubClient client(espClient);    // สร้าง MQTT client โดยใช้ espClient เป็นตัวเชื่อมต่อเครือข่าย
DHT dht(DHTPIN, DHTTYPE);          // สร้างออบเจกต์ DHT โดยบอกขาและชนิดเซนเซอร์ที่ใช้

// ---- ตัวแปรควบคุมเวลาการส่งข้อมูล ----
unsigned long lastSend = 0;             // เก็บเวลาล่าสุดที่ส่งข้อมูลไปแล้ว (หน่วยเป็น ms)
const unsigned long intervalMs = 5000;  // กำหนดให้ส่งทุก 5000 ms = 5 วินาที

// ---- ฟังก์ชันเชื่อมต่อ Wi-Fi ----
void connectWiFi() {                    // สร้างฟังก์ชันเพื่อเชื่อม Wi-Fi (เรียกซ้ำได้)
  WiFi.mode(WIFI_STA);                  // ตั้งโหมดเป็น Station (อุปกรณ์เป็น “ลูกข่าย” ต่อ Wi-Fi)
  WiFi.begin(WIFI_SSID, WIFI_PASS);     // เริ่มเชื่อมต่อ Wi-Fi ด้วย SSID และ Password ที่กำหนด
  Serial.print("WiFi connecting");      // พิมพ์สถานะลง Serial เพื่อดูว่ากำลังเชื่อมอยู่

  while (WiFi.status() != WL_CONNECTED) { // วนรอจนกว่าจะเชื่อมต่อสำเร็จ
    delay(500);                           // หน่วง 0.5 วินาที เพื่อลดการวนเร็วเกินไป
    Serial.print(".");                    // พิมพ์จุดเพื่อให้เห็นว่ากำลังพยายามเชื่อมต่ออยู่
  }

  Serial.println();                      // ขึ้นบรรทัดใหม่หลังเชื่อมต่อสำเร็จ
  Serial.print("WiFi connected, IP: ");  // แจ้งว่าต่อสำเร็จและจะโชว์ IP
  Serial.println(WiFi.localIP());        // แสดง IP ที่เราได้รับจากเราเตอร์ (DHCP)
}

// ---- ฟังก์ชันเชื่อมต่อ MQTT ----
void connectMQTT() {                   // สร้างฟังก์ชันเชื่อม MQTT broker
  while (!client.connected()) {        // ถ้ายังไม่ connected จะวนพยายามเชื่อมเรื่อย ๆ
    Serial.print("MQTT connecting...");// พิมพ์ว่ากำลังเชื่อม MQTT

    if (client.connect("esp32-dht11")) { // ลองเชื่อม MQTT โดยกำหนด Client ID เป็น "esp32-dht11"
      Serial.println("connected");        // ถ้าสำเร็จ พิมพ์ว่า connected
    } else {                              // ถ้าไม่สำเร็จ
      Serial.print("failed, rc=");        // พิมพ์ว่าล้มเหลว พร้อมรหัสสถานะ
      Serial.println(client.state());     // client.state() คืนค่า error code ของ MQTT connection
      delay(1000);                        // หน่วง 1 วิ แล้วค่อยลองใหม่
    }
  }
}

// ---- setup: ทำครั้งเดียวตอนบูต ----
void setup() {
  Serial.begin(115200);              // เปิด Serial ที่ baud rate 115200 เพื่อดู log บน Serial Monitor
  Serial.println("NEW CODE JAN17");  // พิมพ์ข้อความยืนยันว่าเป็นโค้ดชุดนี้กำลังรันอยู่

  dht.begin();                       // เริ่มต้นใช้งาน DHT sensor (ต้องเรียกก่อน read ค่า)
  connectWiFi();                     // เรียกฟังก์ชันเชื่อม Wi-Fi จนกว่าจะต่อสำเร็จ

  client.setServer(MQTT_HOST, MQTT_PORT); // ตั้งค่า MQTT broker (host และ port) ให้ MQTT client รู้ว่าจะต่อไปที่ไหน
  connectMQTT();                          // เชื่อม MQTT จนกว่าจะต่อสำเร็จ
}

// ---- loop: วนทำงานตลอดเวลา ----
void loop() {
  if (!client.connected()) {         // ถ้า MQTT หลุดการเชื่อมต่อ
    connectMQTT();                   // ให้เชื่อมใหม่
  }

  client.loop();                     // สำคัญ: ให้ MQTT client ทำงานเบื้องหลัง (รักษา connection / รับส่ง packet)

  if (millis() - lastSend >= intervalMs) { // เช็คว่าครบเวลา interval (5 วินาที) แล้วหรือยัง
    lastSend = millis();                  // อัปเดตเวลาส่งล่าสุดเป็นเวลาปัจจุบัน

    float temp = dht.readTemperature();   // อ่านค่าอุณหภูมิ (องศาเซลเซียส) จาก DHT11
    float humid = dht.readHumidity();     // อ่านค่าความชื้น (%) จาก DHT11

    if (isnan(temp) || isnan(humid)) {    // isnan = ตรวจว่าค่าที่อ่านมาเป็น NaN (อ่านไม่สำเร็จ)
      Serial.println("อ่าน DHT ไม่ได้");  // แจ้งเตือนว่าอ่านค่าไม่ได้
      return;                             // ออกจาก loop รอบนี้ (รอบหน้าค่อยลองใหม่)
    }

    Serial.print("Temp: ");               // พิมพ์ข้อความ "Temp: "
    Serial.print(temp);                   // พิมพ์ค่าที่อ่านได้
    Serial.print(" C, Humid: ");          // พิมพ์ต่อให้เป็นประโยค
    Serial.print(humid);                  // พิมพ์ค่าความชื้น
    Serial.println(" %");                 // ปิดท้ายด้วย % และขึ้นบรรทัดใหม่

    char payload[64];                     // สร้าง buffer เก็บข้อความที่จะส่งไป MQTT (ขนาด 64 ตัวอักษร)
    snprintf(payload, sizeof(payload),    // สร้างสตริงลง payload แบบปลอดภัย (กันล้น buffer)
             "{\"temp\":%.2f,\"humid\":%.0f}", temp, humid); // จัดรูปแบบเป็น JSON: temp ทศนิยม 2 ตำแหน่ง, humid ปัดเป็นจำนวนเต็ม


```

เเล้วลองเทสดูว่าได้ค่า Temp/Humid ไหม

<div align="left"><figure><img src="../.gitbook/assets/image (6) (1).png" alt=""><figcaption></figcaption></figure></div>

> ถ้า IP ไม่ connet ส่วนมากจะเกิดปัญหาที่ MQTT
