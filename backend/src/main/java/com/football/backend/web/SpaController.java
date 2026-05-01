package com.football.backend.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // 1) "/" -> index.html
    @RequestMapping("/")
    public String index() {
        return "forward:/index.html";
    }

    // 2) Любые пути без расширения и не начинающиеся с /api -> index.html
    @RequestMapping(value = {
            "/{path:[^\\.]*}",
            "/**/{path:[^\\.]*}"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
