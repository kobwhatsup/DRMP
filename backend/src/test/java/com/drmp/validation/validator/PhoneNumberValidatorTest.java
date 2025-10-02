package com.drmp.validation.validator;

import com.drmp.validation.annotation.ValidPhoneNumber;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.validation.ConstraintValidatorContext;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@DisplayName("PhoneNumberValidator 测试")
class PhoneNumberValidatorTest {

    private PhoneNumberValidator validator;
    private ConstraintValidatorContext context;

    @BeforeEach
    void setUp() {
        validator = new PhoneNumberValidator();
        context = mock(ConstraintValidatorContext.class);
    }

    @Test
    @DisplayName("nullable=false时应拒绝空值")
    void shouldRejectNullWhenNotNullable() {
        ValidPhoneNumber annotation = mock(ValidPhoneNumber.class);
        when(annotation.nullable()).thenReturn(false);
        validator.initialize(annotation);
        
        assertFalse(validator.isValid(null, context));
        assertFalse(validator.isValid("", context));
    }

    @Test
    @DisplayName("nullable=true时应接受空值")
    void shouldAcceptNullWhenNullable() {
        ValidPhoneNumber annotation = mock(ValidPhoneNumber.class);
        when(annotation.nullable()).thenReturn(true);
        validator.initialize(annotation);
        
        assertTrue(validator.isValid(null, context));
        assertTrue(validator.isValid("", context));
    }

    @Test
    @DisplayName("应接受有效手机号")
    void shouldAcceptValidPhoneNumber() {
        ValidPhoneNumber annotation = mock(ValidPhoneNumber.class);
        when(annotation.nullable()).thenReturn(false);
        validator.initialize(annotation);
        
        assertTrue(validator.isValid("13800138000", context));
        assertTrue(validator.isValid("15912345678", context));
        assertTrue(validator.isValid("18888888888", context));
        assertTrue(validator.isValid("19912345678", context));
    }

    @Test
    @DisplayName("应拒绝无效手机号格式")
    void shouldRejectInvalidPhoneNumber() {
        ValidPhoneNumber annotation = mock(ValidPhoneNumber.class);
        when(annotation.nullable()).thenReturn(false);
        validator.initialize(annotation);
        
        assertFalse(validator.isValid("1234567890", context));
        assertFalse(validator.isValid("12345678901", context));
        assertFalse(validator.isValid("138001380001", context));
        assertFalse(validator.isValid("11234567890", context));
        assertFalse(validator.isValid("2388888", context));
    }
}
