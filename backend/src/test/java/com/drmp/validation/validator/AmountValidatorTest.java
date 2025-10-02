package com.drmp.validation.validator;

import com.drmp.validation.annotation.ValidAmount;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.validation.ConstraintValidatorContext;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@DisplayName("AmountValidator 测试")
class AmountValidatorTest {

    private AmountValidator validator;
    private ConstraintValidatorContext context;
    private ConstraintValidatorContext.ConstraintViolationBuilder builder;

    @BeforeEach
    void setUp() {
        validator = new AmountValidator();
        context = mock(ConstraintValidatorContext.class);
        builder = mock(ConstraintValidatorContext.ConstraintViolationBuilder.class);
        when(context.buildConstraintViolationWithTemplate(anyString())).thenReturn(builder);
        when(builder.addConstraintViolation()).thenReturn(context);
    }

    @Test
    @DisplayName("nullable=true时应接受null")
    void shouldAcceptNullWhenNullable() {
        ValidAmount annotation = mock(ValidAmount.class);
        when(annotation.nullable()).thenReturn(true);
        when(annotation.min()).thenReturn(0.0);
        when(annotation.max()).thenReturn(Double.MAX_VALUE);
        when(annotation.scale()).thenReturn(2);
        when(annotation.allowNegative()).thenReturn(false);
        validator.initialize(annotation);
        
        assertTrue(validator.isValid(null, context));
    }

    @Test
    @DisplayName("nullable=false时应拒绝null")
    void shouldRejectNullWhenNotNullable() {
        ValidAmount annotation = mock(ValidAmount.class);
        when(annotation.nullable()).thenReturn(false);
        when(annotation.min()).thenReturn(0.0);
        when(annotation.max()).thenReturn(Double.MAX_VALUE);
        when(annotation.scale()).thenReturn(2);
        when(annotation.allowNegative()).thenReturn(false);
        validator.initialize(annotation);
        
        assertFalse(validator.isValid(null, context));
    }

    @Test
    @DisplayName("应接受合法金额范围内的值")
    void shouldAcceptValidAmount() {
        ValidAmount annotation = mock(ValidAmount.class);
        when(annotation.nullable()).thenReturn(false);
        when(annotation.min()).thenReturn(0.0);
        when(annotation.max()).thenReturn(10000.0);
        when(annotation.scale()).thenReturn(2);
        when(annotation.allowNegative()).thenReturn(false);
        validator.initialize(annotation);
        
        assertTrue(validator.isValid(new BigDecimal("100.50"), context));
        assertTrue(validator.isValid(new BigDecimal("0"), context));
        assertTrue(validator.isValid(new BigDecimal("10000"), context));
    }

    @Test
    @DisplayName("应拒绝负数(当allowNegative=false)")
    void shouldRejectNegativeWhenNotAllowed() {
        ValidAmount annotation = mock(ValidAmount.class);
        when(annotation.nullable()).thenReturn(false);
        when(annotation.min()).thenReturn(0.0);
        when(annotation.max()).thenReturn(10000.0);
        when(annotation.scale()).thenReturn(2);
        when(annotation.allowNegative()).thenReturn(false);
        validator.initialize(annotation);
        
        assertFalse(validator.isValid(new BigDecimal("-1"), context));
        assertFalse(validator.isValid(new BigDecimal("-100.50"), context));
    }

    @Test
    @DisplayName("应接受负数(当allowNegative=true)")
    void shouldAcceptNegativeWhenAllowed() {
        ValidAmount annotation = mock(ValidAmount.class);
        when(annotation.nullable()).thenReturn(false);
        when(annotation.min()).thenReturn(-1000.0);
        when(annotation.max()).thenReturn(10000.0);
        when(annotation.scale()).thenReturn(2);
        when(annotation.allowNegative()).thenReturn(true);
        validator.initialize(annotation);
        
        assertTrue(validator.isValid(new BigDecimal("-100"), context));
        assertTrue(validator.isValid(new BigDecimal("-500.50"), context));
    }

    @Test
    @DisplayName("应拒绝超出范围的金额")
    void shouldRejectOutOfRange() {
        ValidAmount annotation = mock(ValidAmount.class);
        when(annotation.nullable()).thenReturn(false);
        when(annotation.min()).thenReturn(10.0);
        when(annotation.max()).thenReturn(100.0);
        when(annotation.scale()).thenReturn(2);
        when(annotation.allowNegative()).thenReturn(false);
        validator.initialize(annotation);
        
        assertFalse(validator.isValid(new BigDecimal("5"), context));
        assertFalse(validator.isValid(new BigDecimal("150"), context));
    }

    @Test
    @DisplayName("应拒绝小数位数过多的金额")
    void shouldRejectTooManyDecimalPlaces() {
        ValidAmount annotation = mock(ValidAmount.class);
        when(annotation.nullable()).thenReturn(false);
        when(annotation.min()).thenReturn(0.0);
        when(annotation.max()).thenReturn(10000.0);
        when(annotation.scale()).thenReturn(2);
        when(annotation.allowNegative()).thenReturn(false);
        validator.initialize(annotation);
        
        assertFalse(validator.isValid(new BigDecimal("100.123"), context));
        assertFalse(validator.isValid(new BigDecimal("50.5555"), context));
    }

    @Test
    @DisplayName("应接受符合小数位数要求的金额")
    void shouldAcceptValidDecimalPlaces() {
        ValidAmount annotation = mock(ValidAmount.class);
        when(annotation.nullable()).thenReturn(false);
        when(annotation.min()).thenReturn(0.0);
        when(annotation.max()).thenReturn(10000.0);
        when(annotation.scale()).thenReturn(2);
        when(annotation.allowNegative()).thenReturn(false);
        validator.initialize(annotation);
        
        assertTrue(validator.isValid(new BigDecimal("100"), context));
        assertTrue(validator.isValid(new BigDecimal("100.5"), context));
        assertTrue(validator.isValid(new BigDecimal("100.50"), context));
    }
}
