#include <Arduino.h>
#include <TFT_eSPI.h>
#include <lvgl.h>

/* 
 * ALoT Locker UI - LVGL Port (ESP32-S3)
 * Replicates the "Welcome" & "Identify" screens in raw C++.
 */

TFT_eSPI tft = TFT_eSPI();

// --- Globals & State ---
lv_obj_t * screen_welcome;
lv_obj_t * screen_keyboard;
lv_obj_t * ta_input;
lv_obj_t * kb;
lv_obj_t * autocomplete_panel;
lv_obj_t * suggestion_btns[3];

// ALoT Theme Styles
lv_style_t style_btn;
lv_style_t style_btn_pr;

// Mock BIP39 Dictionary (truncated for demo)
const char * dictionary[] = {
    "APPLE", "BEAR", "CLOUD", "DREAM", "EAGLE", 
    "FORT", "GIANT", "HEART", "ISLAND", "JUMBO",
    "JUMP", "JUST", "JUNGLE", "KITE", "LION"
};
const int dict_size = 15;

// --- LVGL Display & Touch Drivers ---
void my_disp_flush(lv_disp_drv_t *disp, const lv_area_t *area, lv_color_t *color_p) {
    uint32_t w = (area->x2 - area->x1 + 1);
    uint32_t h = (area->y2 - area->y1 + 1);
    tft.startWrite();
    tft.setAddrWindow(area->x1, area->y1, w, h);
    tft.pushColors((uint16_t *)&color_p->full, w * h, true);
    tft.endWrite();
    lv_disp_flush_ready(disp);
}

void my_touchpad_read(lv_indev_drv_t *indev_driver, lv_indev_data_t *data) {
    // Hardware sensing
}

// --- Theme Init ---
void init_alot_styles() {
    lv_style_init(&style_btn);
    lv_style_set_radius(&style_btn, 0); 
    lv_style_set_bg_color(&style_btn, lv_color_hex(0xE84E36));
    lv_style_set_text_color(&style_btn, lv_color_hex(0xFFFFFF));
    lv_style_set_text_font(&style_btn, &lv_font_montserrat_14);
    lv_style_set_border_width(&style_btn, 0);
    lv_style_set_shadow_color(&style_btn, lv_color_hex(0xDBCAC4));
    lv_style_set_shadow_width(&style_btn, 0);
    lv_style_set_shadow_ofs_x(&style_btn, 2);
    lv_style_set_shadow_ofs_y(&style_btn, 2);

    lv_style_init(&style_btn_pr);
    lv_style_set_translate_x(&style_btn_pr, 2);
    lv_style_set_translate_y(&style_btn_pr, 2);
    lv_style_set_shadow_ofs_x(&style_btn_pr, 0);
    lv_style_set_shadow_ofs_y(&style_btn_pr, 0);
}

// --- Event Callbacks ---
static void btn_start_event_cb(lv_event_t * e) {
    lv_scr_load_anim(screen_keyboard, LV_SCR_LOAD_ANIM_MOVE_LEFT, 300, 0, false);
}

static void suggestion_clicked_cb(lv_event_t * e) {
    lv_obj_t * btn = lv_event_get_target(e);
    lv_obj_t * label = lv_obj_get_child(btn, 0);
    const char * word = lv_label_get_text(label);
    
    // Append the selected word and a space
    lv_textarea_add_text(ta_input, word);
    lv_textarea_add_text(ta_input, " ");
    
    // Hide suggestions until next type
    lv_obj_add_flag(autocomplete_panel, LV_OBJ_FLAG_HIDDEN);
}

static void text_changed_cb(lv_event_t * e) {
    const char * current_txt = lv_textarea_get_text(ta_input);
    int len = strlen(current_txt);
    
    // If empty or ends in space, hide suggestions
    if(len == 0 || current_txt[len-1] == ' ') {
        lv_obj_add_flag(autocomplete_panel, LV_OBJ_FLAG_HIDDEN);
        return;
    }

    // Extract the CURRENT partial word being typed
    int last_space = -1;
    for(int i = len - 1; i >= 0; i--) {
        if(current_txt[i] == ' ') { last_space = i; break; }
    }
    
    String search_str = String(current_txt).substring(last_space + 1);
    search_str.toUpperCase();
    
    if(search_str.length() == 0) {
        lv_obj_add_flag(autocomplete_panel, LV_OBJ_FLAG_HIDDEN);
        return;
    }

    // Search dictionary
    int found_count = 0;
    for(int i = 0; i < dict_size && found_count < 3; i++) {
        if(String(dictionary[i]).startsWith(search_str)) {
            // Update the suggestion button label
            lv_obj_t * label = lv_obj_get_child(suggestion_btns[found_count], 0);
            
            // We only want to append the REMAINING letters of the word when clicked, 
            // OR we replace the whole word. Replacing is easier.
            // For now, let's just show the full word to tap.
            lv_label_set_text(label, dictionary[i]);
            lv_obj_clear_flag(suggestion_btns[found_count], LV_OBJ_FLAG_HIDDEN);
            found_count++;
        }
    }
    
    // Hide unused buttons
    for(int i = found_count; i < 3; i++) {
        lv_obj_add_flag(suggestion_btns[i], LV_OBJ_FLAG_HIDDEN);
    }

    if(found_count > 0) {
        lv_obj_clear_flag(autocomplete_panel, LV_OBJ_FLAG_HIDDEN);
    } else {
        lv_obj_add_flag(autocomplete_panel, LV_OBJ_FLAG_HIDDEN);
    }
}

// --- Screen Builders ---
void build_welcome_screen() {
    screen_welcome = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(screen_welcome, lv_color_hex(0xFFF7F0), 0);

    lv_obj_t * logo = lv_label_create(screen_welcome);
    lv_label_set_text(logo, "ALoT");
    lv_obj_set_style_text_color(logo, lv_color_hex(0xE84E36), 0);
    lv_obj_set_style_text_font(logo, &lv_font_montserrat_32, 0);
    lv_obj_align(logo, LV_ALIGN_TOP_MID, 0, 60);

    lv_obj_t * btn = lv_btn_create(screen_welcome);
    lv_obj_set_size(btn, 180, 50);
    lv_obj_align(btn, LV_ALIGN_CENTER, 0, 30);
    lv_obj_add_style(btn, &style_btn, 0);
    lv_obj_add_style(btn, &style_btn_pr, LV_STATE_PRESSED);
    lv_obj_add_event_cb(btn, btn_start_event_cb, LV_EVENT_CLICKED, NULL);

    lv_obj_t * btn_label = lv_label_create(btn);
    lv_label_set_text(btn_label, "Enter Access Phrase");
    lv_obj_center(btn_label);
}

void build_word_screen() {
    screen_keyboard = lv_obj_create(NULL);
    lv_obj_set_style_bg_color(screen_keyboard, lv_color_hex(0xFFF7F0), 0);

    // Text Input Area
    ta_input = lv_textarea_create(screen_keyboard);
    lv_textarea_set_one_line(ta_input, true);
    lv_obj_set_size(ta_input, 220, 40);
    lv_obj_align(ta_input, LV_ALIGN_TOP_MID, 0, 10);
    lv_textarea_set_placeholder_text(ta_input, "e.g. BEAR CLOUD...");
    lv_obj_add_event_cb(ta_input, text_changed_cb, LV_EVENT_VALUE_CHANGED, NULL);

    // Keyboard
    kb = lv_keyboard_create(screen_keyboard);
    lv_obj_set_size(kb, 240, 130);
    lv_obj_align(kb, LV_ALIGN_BOTTOM_MID, 0, 0);
    lv_keyboard_set_textarea(kb, ta_input);

    // Autocomplete Panel (Floats above keyboard)
    autocomplete_panel = lv_obj_create(screen_keyboard);
    lv_obj_set_size(autocomplete_panel, 230, 45);
    lv_obj_align(autocomplete_panel, LV_ALIGN_TOP_MID, 0, 60);
    lv_obj_set_style_bg_color(autocomplete_panel, lv_color_hex(0xFFFFFF), 0);
    lv_obj_set_style_border_width(autocomplete_panel, 0, 0);
    lv_obj_set_style_pad_all(autocomplete_panel, 2, 0);
    lv_obj_set_layout(autocomplete_panel, LV_LAYOUT_FLEX);
    lv_obj_set_flex_flow(autocomplete_panel, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(autocomplete_panel, LV_FLEX_ALIGN_SPACE_EVENLY, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_add_flag(autocomplete_panel, LV_OBJ_FLAG_HIDDEN); // Hidden by default

    // Create 3 suggestion buttons
    for(int i=0; i<3; i++) {
        suggestion_btns[i] = lv_btn_create(autocomplete_panel);
        lv_obj_set_size(suggestion_btns[i], 70, 35);
        lv_obj_add_style(suggestion_btns[i], &style_btn, 0);
        lv_obj_add_event_cb(suggestion_btns[i], suggestion_clicked_cb, LV_EVENT_CLICKED, NULL);

        lv_obj_t * lbl = lv_label_create(suggestion_btns[i]);
        lv_label_set_text(lbl, "");
        lv_obj_set_style_text_font(lbl, &lv_font_montserrat_14, 0);
        lv_obj_center(lbl);
        lv_obj_add_flag(suggestion_btns[i], LV_OBJ_FLAG_HIDDEN);
    }
}

void setup() {
    Serial.begin(115200);

    // Init Display
    tft.begin();
    tft.setRotation(0); // Portrait (240x320)

    // Init LVGL
    lv_init();
    static lv_disp_draw_buf_t draw_buf;
    static lv_color_t buf[240 * 32];
    lv_disp_draw_buf_init(&draw_buf, buf, NULL, 240 * 32);

    static lv_disp_drv_t disp_drv;
    lv_disp_drv_init(&disp_drv);
    disp_drv.hor_res = 240;
    disp_drv.ver_res = 320;
    disp_drv.flush_cb = my_disp_flush;
    disp_drv.draw_buf = &draw_buf;
    lv_disp_drv_register(&disp_drv);

    static lv_indev_drv_t indev_drv;
    lv_indev_drv_init(&indev_drv);
    indev_drv.type = LV_INDEV_TYPE_POINTER;
    indev_drv.read_cb = my_touchpad_read;
    lv_indev_drv_register(&indev_drv);

    // Build the UI
    init_alot_styles();
    build_welcome_screen();
    build_word_screen();

    // Start on Welcome Screen
    lv_scr_load(screen_welcome);
}

void loop() {
    lv_timer_handler(); 
    delay(5);
}

