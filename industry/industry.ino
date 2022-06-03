#include <WiFi.h>
#include <WiFiManager.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Ultrasonic
#define pin_h_trigger 27
#define pin_h_echo 26
#define pin_l_trigger 13
#define pin_l_echo 12
int ultrasonic_threshold = 0;
int ultrasonic_counter = 0;
int h_distance_detected = 0;
int l_distance_detected = 0;

// API
int h_distance_min;
int h_distance_max;
int h_distance_avg = 0;
int l_distance_min;
int l_distance_max;
int l_distance_avg = 0;
float distance_time;
String rack_id = "";
int rack_row = 3;
portMUX_TYPE mux = portMUX_INITIALIZER_UNLOCKED;
String predictionAPI = "https://deliveryevesg1minimalapi.livelygrass-d3385627.northeurope.azurecontainerapps.io/predict";
String restockAPI = "https://deliveryevesg1minimalapi.livelygrass-d3385627.northeurope.azurecontainerapps.io/restock" + rack_id;
String rackIdAPI = "https://deliveryevesg1minimalapi.livelygrass-d3385627.northeurope.azurecontainerapps.io/racks/" + rack_id;

// Wifi
WiFiManager wifiManager;
HTTPClient http;

// Timer
long timer_detection;
long timer_first = 0;
int timer_delay = 50;

// Misc
bool detection = false;
int selected = 0;


void setup() {
  Serial.begin(9600);
  pinMode(2, OUTPUT);
  pinMode(pin_h_trigger, OUTPUT);
  pinMode(pin_l_trigger, OUTPUT);
  pinMode(pin_h_echo, INPUT);
  pinMode(pin_l_echo, INPUT);
  
  wifiManager.setDebugOutput(true);
  std::vector<const char *> menu = {"wifi"};
  wifiManager.setMenu(menu);
  wifiManager.setHostname("DeliverYvesRek");
  wifiManager.autoConnect("DeliverYvesRek");
  rack_id = WiFi.macAddress();
  postRackId();

  startupSequence();
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {  
    int h_distance;
    int l_distance;
    
    if (detection) {
      if (timer_first == 0) {
        timer_first = millis();
      }

      if (h_distance_detected != 0 && l_distance_detected != 0) {
        h_distance = h_distance_detected;
        l_distance = l_distance_detected;  

        h_distance_detected = 0;
        l_distance_detected = 0;
      } else {
        ultrasonicDistances(&h_distance, &l_distance);
      }
            
      if (h_distance != 0 && l_distance != 0) {
        timer_detection = millis();
        ultrasonic_counter += 1;  

        
        Serial.print(h_distance);
        Serial.print(" ");
        Serial.println(l_distance);
        
        h_distance_avg += h_distance;
        l_distance_avg += l_distance;
  
        if (h_distance_min == 0) {
          h_distance_min = h_distance; 
        } else if (h_distance < h_distance_min) {
          h_distance_min = h_distance; 
        }
        if (h_distance > h_distance_max) {
          h_distance_max = h_distance; 
        }
        if (l_distance_min == 0) {
          l_distance_min = l_distance; 
        } else if (l_distance < l_distance_min) {
          l_distance_min = l_distance; 
        }
        if (l_distance > l_distance_max) {
          l_distance_max = l_distance; 
        }
        
        
      } else if (ultrasonic_counter != 0) {
        if (millis() - timer_detection > 5000) {
          distance_time = millis() - timer_first - 5000;
          h_distance_avg = h_distance_avg / ultrasonic_counter;
          l_distance_avg = l_distance_avg / ultrasonic_counter;
          
          digitalWrite(2, LOW);
          detection = false;

          
          
          sendData();
          dataClear();

          
          Serial.println("Done");
          Serial.println("");
         }  
      } else {
        if (millis() - timer_detection > 3000) {
          digitalWrite(2, LOW);
          detection = false;
        }
      }
    } else {
      ultrasonicDetection(&h_distance_detected, &l_distance_detected);  
    }
    delay(timer_delay);
  }
}

void dataClear() {
  h_distance_min = 0;
  h_distance_max = 0;
  h_distance_avg = 0;
  l_distance_min = 0;
  l_distance_max = 0;
  l_distance_avg = 0;
  distance_time = 0;

  timer_first = 0;
  ultrasonic_counter = 0;
}

void sendData(){
      
          Serial.println(rack_id);
          Serial.println("");
  
      http.begin(predictionAPI);
      http.addHeader("Content-Type", "application/json");

      StaticJsonDocument<512> doc;
      doc["RackId"] = rack_id;
      doc["Row"] = rack_row;
      doc["DistMinH"] = h_distance_min;
      doc["DistMaxH"] = h_distance_max;
      doc["DistAvgH"] = h_distance_avg;
      doc["DistMinL"] = l_distance_min;
      doc["DistMaxL"] = l_distance_max;
      doc["DistAvgL"] = l_distance_avg;
      doc["DistTime"] = distance_time;

      String requestBody;
      serializeJson(doc, requestBody);
      int httpResponseCode = http.POST(requestBody);
      http.end();

      
          Serial.println(requestBody);
          Serial.println(httpResponseCode);
}

void postRackId(){
  if(WiFi.status()== WL_CONNECTED){
    http.begin(rackIdAPI);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> doc;
    doc["RackId"] = rack_id;
    
    String requestBody;
    serializeJson(doc, requestBody);
    int httpResponseCode = http.POST(requestBody);
    http.end();
  }
}



void ultrasonicDistances(int *h_distance, int *l_distance) {
  int h_measurement = ultrasonicDistance(pin_h_trigger, pin_h_echo);
  int l_measurement = ultrasonicDistance(pin_l_trigger, pin_l_echo);

  if (h_measurement <= ultrasonic_threshold && l_measurement <= ultrasonic_threshold) {
    *h_distance = h_measurement;
    *l_distance = l_measurement;
    return;
  } else if (h_measurement <= ultrasonic_threshold) {
    *h_distance = h_measurement;
    *l_distance = h_measurement;
    return;
  } else if (l_measurement <= ultrasonic_threshold) {
    *h_distance = l_measurement;
    *l_distance = l_measurement;
    return;
  } else {
    *h_distance = 0;
    *l_distance = 0;
    return;
  }
}

void ultrasonicDetection(int *h_distance, int *l_distance) {
  int h;
  int l;
  ultrasonicDistances(&h, &l);

  if (h != 0 && l != 0) {
    *h_distance = h;
    *l_distance = l;
    
    detection = true;
    digitalWrite(2, HIGH);
    timer_delay = 80;
  }
}

void startupSequence() {
  int threshold_h = 0;
  int threshold_l = 0;
  while (threshold_h == 0 && threshold_l == 0) {
    threshold_h = ultrasonicDistance(pin_h_trigger, pin_h_echo);
    threshold_l = ultrasonicDistance(pin_l_trigger, pin_l_echo);
    delay(80);
  }
  ultrasonic_threshold = ((threshold_h + threshold_l) / 2) - 5;
}

int ultrasonicDistance(int pin_trigger, int pin_echo) {
  digitalWrite(pin_trigger, LOW);
  delayMicroseconds(2);
  digitalWrite(pin_trigger, HIGH);
  delayMicroseconds(10);
  digitalWrite(pin_trigger, LOW);

  int duration = pulseIn(pin_echo, HIGH);
  int distance = duration * 0.017;
  delay(50);
  return distance;
}
