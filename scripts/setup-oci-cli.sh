#!/bin/bash

# Installation et configuration OCI CLI
# Pour automatiser le déploiement sur Oracle Cloud

echo "🔧 Installation OCI CLI pour automatisation Oracle Cloud"
echo "======================================================="

# Installation OCI CLI
if ! command -v oci &> /dev/null; then
    echo "📦 Installation OCI CLI..."
    
    # Pour Ubuntu/Debian
    if [ -f /etc/debian_version ]; then
        bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)" --accept-all-defaults
    else
        # Installation manuelle
        pip3 install oci-cli || {
            echo "❌ Échec installation pip, essayez: sudo apt install python3-pip"
            exit 1
        }
    fi
    
    echo "✅ OCI CLI installé"
else
    echo "✅ OCI CLI déjà installé"
fi

# Configuration
echo ""
echo "📋 Configuration OCI CLI..."
echo "Vous aurez besoin de:"
echo "  - User OCID"
echo "  - Tenancy OCID"
echo "  - Region (ex: us-ashburn-1)"
echo "  - Fingerprint de votre clé API"
echo "  - Clé privée API"
echo ""
echo "Exécutez: oci setup config"
echo "Ou utilisez: oci setup bootstrap"

