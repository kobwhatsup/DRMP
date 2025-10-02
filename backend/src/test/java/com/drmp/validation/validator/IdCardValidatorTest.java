package com.drmp.validation.validator;

import com.drmp.validation.annotation.ValidIdCard;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.validation.ConstraintValidatorContext;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@DisplayName("IdCardValidator 测试")
class IdCardValidatorTest {

    private IdCardValidator validator;
    private ConstraintValidatorContext context;

    @BeforeEach
    void setUp() {
        validator = new IdCardValidator();
        context = mock(ConstraintValidatorContext.class);
    }

    @Test
    @DisplayName("nullable=false时应拒绝空值")
    void shouldRejectNullWhenNotNullable() {
        ValidIdCard annotation = mock(ValidIdCard.class);
        when(annotation.nullable()).thenReturn(false);
        validator.initialize(annotation);
        
        assertFalse(validator.isValid(null, context));
        assertFalse(validator.isValid("", context));
    }

    @Test
    @DisplayName("nullable=true时应接受空值")
    void shouldAcceptNullWhenNullable() {
        ValidIdCard annotation = mock(ValidIdCard.class);
        when(annotation.nullable()).thenReturn(true);
        validator.initialize(annotation);
        
        assertTrue(validator.isValid(null, context));
        assertTrue(validator.isValid("", context));
    }

    @Test
    @DisplayName("应拒绝格式不正确的身份证号")
    void shouldRejectInvalidFormat() {
        ValidIdCard annotation = mock(ValidIdCard.class);
        when(annotation.nullable()).thenReturn(false);
        validator.initialize(annotation);
        
        assertFalse(validator.isValid("123456", context));
        assertFalse(validator.isValid("11010119900399123X", context));
        assertFalse(validator.isValid("00010119900307123X", context));
    }

    @Test
    @DisplayName("应拒绝长度不是18位的身份证号")
    void shouldRejectNon18DigitIdCard() {
        ValidIdCard annotation = mock(ValidIdCard.class);
        when(annotation.nullable()).thenReturn(false);
        validator.initialize(annotation);
        
        assertFalse(validator.isValid("11010119900307123", context));
        assertFalse(validator.isValid("110101199003071234X", context));
    }
}
