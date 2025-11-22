package edu.pw.auth.config;

import io.micronaut.context.annotation.ConfigurationProperties;
import io.micronaut.http.cookie.SameSite;

@ConfigurationProperties("auth.cookie")
public class AuthCookieProperties {
    private boolean secure = true;
    private SameSite sameSite = SameSite.Strict;
    private String path = "/";
    private String domain; // opcjonalnie

    public boolean isSecure() {
        return secure;
    }

    public void setSecure(boolean secure) {
        this.secure = secure;
    }

    public SameSite getSameSite() {
        return sameSite;
    }

    public void setSameSite(SameSite sameSite) {
        this.sameSite = sameSite;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }
}
