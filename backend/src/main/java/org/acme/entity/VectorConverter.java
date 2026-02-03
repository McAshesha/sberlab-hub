package org.acme.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.postgresql.util.PGobject;

import java.sql.SQLException;

/**
 * Hibernate converter for PostgreSQL vector type.
 * Converts between String representation and pgvector's native type.
 */
@Converter(autoApply = false)
public class VectorConverter implements AttributeConverter<String, Object> {

    @Override
    public Object convertToDatabaseColumn(String attribute) {
        if (attribute == null) {
            return null;
        }

        try {
            PGobject pgObject = new PGobject();
            pgObject.setType("vector");
            pgObject.setValue(attribute);
            return pgObject;
        } catch (SQLException e) {
            throw new RuntimeException("Failed to convert vector to database column", e);
        }
    }

    @Override
    public String convertToEntityAttribute(Object dbData) {
        if (dbData == null) {
            return null;
        }

        if (dbData instanceof PGobject pgObject) {
            return pgObject.getValue();
        }

        return dbData.toString();
    }
}
