#!/bin/bash

# Création automatique d'une instance Oracle Cloud et déploiement de Medusa
# Nécessite OCI CLI configuré

set -e

# Configuration
COMPARTMENT_OCID="${OCI_COMPARTMENT_OCID}"
AD_OCID="${OCI_AD_OCID:-}"  # Availability Domain
SUBNET_OCID="${OCI_SUBNET_OCID}"
IMAGE_OCID="${OCI_IMAGE_OCID:-ocid1.image.oc1..aaaaaaaamf7zr3v2wz5d5q4m4..."}"  # Ubuntu 22.04
SHAPE="${OCI_SHAPE:-VM.Standard.A1.Flex}"
OCPUS=1
MEMORY_GB=6

echo "🚀 Création automatique instance Oracle Cloud"
echo "=============================================="

# Vérifier OCI CLI
if ! command -v oci &> /dev/null; then
    echo "❌ OCI CLI non installé"
    echo "Installez avec: bash scripts/setup-oci-cli.sh"
    exit 1
fi

# Vérifier configuration
if ! oci iam region list &> /dev/null; then
    echo "❌ OCI CLI non configuré"
    echo "Configurez avec: oci setup config"
    exit 1
fi

echo "✅ OCI CLI configuré"

# Demander les informations nécessaires
if [ -z "$COMPARTMENT_OCID" ]; then
    echo ""
    echo "📋 Informations requises:"
    read -p "Compartment OCID: " COMPARTMENT_OCID
    read -p "Subnet OCID: " SUBNET_OCID
    read -p "Availability Domain (optionnel): " AD_OCID
fi

# Générer une clé SSH
echo ""
echo "🔑 Génération clé SSH..."
SSH_KEY_NAME="medusa-key-$(date +%s)"
ssh-keygen -t rsa -b 4096 -f ~/.ssh/$SSH_KEY_NAME -N "" -q
PUBLIC_KEY=$(cat ~/.ssh/$SSH_KEY_NAME.pub)

# Créer l'instance
echo ""
echo "🖥️  Création de l'instance..."
INSTANCE_NAME="medusa-backend-$(date +%s)"

# Préparer le JSON de configuration
cat > /tmp/instance-config.json <<JSON
{
  "compartmentId": "$COMPARTMENT_OCID",
  "displayName": "$INSTANCE_NAME",
  "availabilityDomain": "$AD_OCID",
  "shape": "$SHAPE",
  "shapeConfig": {
    "ocpus": $OCPUS,
    "memoryInGBs": $MEMORY_GB
  },
  "sourceDetails": {
    "sourceType": "image",
    "imageId": "$IMAGE_OCID"
  },
  "createVnicDetails": {
    "subnetId": "$SUBNET_OCID",
    "assignPublicIp": true
  },
  "metadata": {
    "ssh_authorized_keys": "$PUBLIC_KEY"
  }
}
JSON

# Créer l'instance
INSTANCE_OCID=$(oci compute instance launch \
    --from-json file:///tmp/instance-config.json \
    --query 'data.id' \
    --raw-output)

echo "✅ Instance créée: $INSTANCE_OCID"

# Attendre que l'instance soit en cours d'exécution
echo ""
echo "⏳ Attente du démarrage de l'instance..."
sleep 30

for i in {1..30}; do
    STATE=$(oci compute instance get --instance-id $INSTANCE_OCID --query 'data."lifecycle-state"' --raw-output)
    if [ "$STATE" == "RUNNING" ]; then
        echo "✅ Instance en cours d'exécution"
        break
    fi
    echo "   État: $STATE (attente...)"
    sleep 10
done

# Récupérer l'IP publique
echo ""
echo "🌐 Récupération de l'IP publique..."
PUBLIC_IP=$(oci compute instance list-vnics \
    --instance-id $INSTANCE_OCID \
    --query 'data[0]."public-ip"' \
    --raw-output)

echo "✅ IP publique: $PUBLIC_IP"

# Attendre que SSH soit disponible
echo ""
echo "⏳ Attente SSH..."
for i in {1..30}; do
    if ssh -i ~/.ssh/$SSH_KEY_NAME -o ConnectTimeout=5 -o StrictHostKeyChecking=no ubuntu@$PUBLIC_IP "echo OK" &> /dev/null; then
        echo "✅ SSH accessible"
        break
    fi
    echo "   Tentative $i/30..."
    sleep 5
done

# Déployer Medusa
echo ""
echo "🚀 Déploiement de Medusa..."
scp -i ~/.ssh/$SSH_KEY_NAME -o StrictHostKeyChecking=no \
    scripts/deploy-oracle-complete.sh \
    ubuntu@$PUBLIC_IP:/home/ubuntu/

ssh -i ~/.ssh/$SSH_KEY_NAME -o StrictHostKeyChecking=no ubuntu@$PUBLIC_IP <<DEPLOY
chmod +x /home/ubuntu/deploy-oracle-complete.sh
/home/ubuntu/deploy-oracle-complete.sh
DEPLOY

echo ""
echo "=============================================="
echo "✅ DÉPLOIEMENT TERMINÉ!"
echo "=============================================="
echo ""
echo "🌐 Backend Medusa: http://$PUBLIC_IP:9000"
echo "🔑 Clé SSH: ~/.ssh/$SSH_KEY_NAME"
echo ""
echo "⚠️  Configurez le firewall Oracle Cloud (port 9000)"
echo ""

