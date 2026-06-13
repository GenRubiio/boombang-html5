-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: boombang_refactor
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `api_keys`
--

DROP TABLE IF EXISTS `api_keys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_keys` (
  `id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `key` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_keys`
--

LOCK TABLES `api_keys` WRITE;
/*!40000 ALTER TABLE `api_keys` DISABLE KEYS */;
/*!40000 ALTER TABLE `api_keys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bot_facts`
--

DROP TABLE IF EXISTS `bot_facts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bot_facts` (
  `id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL COMMENT 'User ID',
  `bot_id` bigint unsigned NOT NULL COMMENT 'Bot ID',
  `fact` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Persistent fact about user',
  `confidence` tinyint NOT NULL DEFAULT '100' COMMENT 'Confidence level 0-100',
  `source` enum('extracted','manual') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'extracted',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bot_facts`
--

LOCK TABLES `bot_facts` WRITE;
/*!40000 ALTER TABLE `bot_facts` DISABLE KEYS */;
/*!40000 ALTER TABLE `bot_facts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bot_messages`
--

DROP TABLE IF EXISTS `bot_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bot_messages` (
  `id` bigint unsigned NOT NULL,
  `sender_type` enum('user','bot') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Sender type',
  `sender_id` bigint unsigned NOT NULL COMMENT 'User ID (bot or normal user)',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Message text',
  `language` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Detected language',
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin COMMENT 'Metadata: provider, tokens, width_px, etc.',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  CONSTRAINT `bot_messages_chk_1` CHECK (json_valid(`metadata`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bot_messages`
--

LOCK TABLES `bot_messages` WRITE;
/*!40000 ALTER TABLE `bot_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `bot_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bot_summaries`
--

DROP TABLE IF EXISTS `bot_summaries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bot_summaries` (
  `id` bigint unsigned NOT NULL,
  `bot_id` bigint unsigned NOT NULL COMMENT 'Bot ID',
  `user_id` bigint unsigned NOT NULL COMMENT 'User ID',
  `summary` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Compact conversation summary',
  `last_message_id` bigint unsigned DEFAULT NULL COMMENT 'Last processed message ID',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bot_summaries`
--

LOCK TABLES `bot_summaries` WRITE;
/*!40000 ALTER TABLE `bot_summaries` DISABLE KEYS */;
/*!40000 ALTER TABLE `bot_summaries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catalog_categories`
--

DROP TABLE IF EXISTS `catalog_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catalog_categories` (
  `id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catalog_categories`
--

LOCK TABLES `catalog_categories` WRITE;
/*!40000 ALTER TABLE `catalog_categories` DISABLE KEYS */;
INSERT INTO `catalog_categories` VALUES (1,'Default',NULL,'Default category for catalog items.',1,'2025-08-08 11:24:20','2025-08-08 11:24:20');
/*!40000 ALTER TABLE `catalog_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catalog_item_requirements`
--

DROP TABLE IF EXISTS `catalog_item_requirements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catalog_item_requirements` (
  `id` bigint unsigned NOT NULL,
  `catalog_item_id` bigint unsigned NOT NULL,
  `required_catalog_item_id` bigint unsigned DEFAULT NULL,
  `required_quantity` int NOT NULL DEFAULT '1',
  `required_gold_coins` int NOT NULL DEFAULT '0',
  `required_silver_coins` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catalog_item_requirements`
--

LOCK TABLES `catalog_item_requirements` WRITE;
/*!40000 ALTER TABLE `catalog_item_requirements` DISABLE KEYS */;
/*!40000 ALTER TABLE `catalog_item_requirements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catalog_items`
--

DROP TABLE IF EXISTS `catalog_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catalog_items` (
  `id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sprite_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` text COLLATE utf8mb4_unicode_ci,
  `spreadsheet` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `atlas` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` int NOT NULL DEFAULT '1000',
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'scene_item',
  `stars` int NOT NULL DEFAULT '1',
  `price_type` enum('golden_coins','silver_coins','stripe_payment') COLLATE utf8mb4_unicode_ci DEFAULT 'golden_coins',
  `discount` int NOT NULL DEFAULT '0',
  `stripe_price_usd` decimal(8,2) DEFAULT NULL,
  `reward_type` enum('item','golden_coins','silver_coins','mixed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'item',
  `reward_golden_coins` int NOT NULL DEFAULT '0',
  `reward_silver_coins` int NOT NULL DEFAULT '0',
  `map_size` text COLLATE utf8mb4_unicode_ci,
  `user_decoration_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_decoration_value` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scale` int NOT NULL DEFAULT '1',
  `in_lobby_gacha` tinyint(1) NOT NULL DEFAULT '0',
  `show_in_inventory` tinyint(1) NOT NULL DEFAULT '1',
  `is_multi_buy` tinyint(1) NOT NULL DEFAULT '1',
  `min_purchase_quantity` int NOT NULL DEFAULT '1',
  `max_purchase_quantity` int NOT NULL DEFAULT '10',
  `is_read_only` tinyint(1) NOT NULL DEFAULT '0',
  `is_purchasable` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `parent_id` int unsigned DEFAULT NULL,
  `lft` int unsigned DEFAULT NULL,
  `rgt` int unsigned DEFAULT NULL,
  `depth` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `type_of_behavior` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catalog_items`
--

LOCK TABLES `catalog_items` WRITE;
/*!40000 ALTER TABLE `catalog_items` DISABLE KEYS */;
INSERT INTO `catalog_items` VALUES (17,1,NULL,'{\"en\":\"Esfera de Keko Radiante\"}','radiant_mobster_orb','uploads/catalog/esfera-de-keko-radiante/VpcqCahjcvMzmts4qvZrJoZSrxWJchG9seg6ISjj.webp','uploads/catalog/esfera-de-keko-radiante/jFc1OnfeBxFIEJZvN7SCf0Yzof7ZtUspEy7sz4ee.webm',NULL,'{\"en\":\"<p>Un recipiente cilíndrico brillante que contiene una esfera flotante con la enigmática expresión del Keko, iluminado desde abajo y rodeado de burbujas verdes. Esta reliquia digital aporta un aura de misterio y audacia al entorno: enciende tu isla con su brillo vibrante y deja que todos pregunten qué secretos esconde.</p>\"}',0,'scene_item',4,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-01 17:31:56','2025-09-01 17:33:17',103,120,'normal'),(20,1,NULL,'{\"en\":\"Conejo tematico cavallero\"}','conejo_tematico_cavallero','uploads/catalog/conejo-tematico-cavallero/G7JYzqr3hQMUHmj91TaeIenedycqfPByX5E9FZxK.png','uploads/catalog/conejo-tematico-cavallero/ySrdvnSTGd0FAUAs8YwBjvC1Ji7OambMoFQ51dUN.png',NULL,'{\"en\":\"<p>Conejo tematico cavallero</p>\"}',0,'scene_item',2,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-10 19:35:09','2025-09-10 19:35:09',NULL,NULL,'normal'),(21,1,NULL,'{\"en\":\"Cabesa Boomer\"}','cabeza_boomer','uploads/catalog/cabesa-boomer/QpGsCKMW1DrQmMEquCvEfoSxDanRvdp0FD54DLUq.png','uploads/catalog/cabesa-boomer/9zSt5lcmmWruQZZcyYJ9ogNHQYkFVHSbhfFgYIIg.webm',NULL,'{\"en\":\"<p>Cabesa Boomer</p>\"}',0,'scene_item',4,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-10 19:47:21','2025-09-11 19:04:46',103,120,'normal'),(22,1,NULL,'{\"en\":\"huevop_tentacle\"}','huevop_tentacle','uploads/catalog/huevop-tentacle/UmJE4m4G46AayzYRL8SYcvQGgTT18h1kDvQ4pNqM.png','uploads/catalog/huevop-tentacle/yTAVvl8tjn9KpDli27ZPvsoRKjF7jLAQeuDhztah.png',NULL,'{\"en\":\"<p>huevop_tentacle</p>\"}',0,'scene_item',3,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 10:41:42','2025-09-11 18:49:43',NULL,NULL,'normal'),(23,1,NULL,'{\"en\":\"huevo_dorado\"}','huevo_dorado','uploads/catalog/huevo-dorado/Nx9MIMkowTYTMbtTvBPMmrNWUYsOLodtJtZUZ3by.png','uploads/catalog/huevo-dorado/OzX7W2qEXKwnqfVn51RQaErCdm5S1ocondy6f1c2.webm',NULL,'{\"en\":\"<p>huevo_dorado</p>\"}',0,'scene_item',3,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 10:43:53','2025-09-11 18:50:40',468,346,'normal'),(24,1,NULL,'{\"en\":\"art_egg\"}','art_egg','uploads/catalog/art-egg/c2sPIcXo9qCgwZ18vWvuZsVq4N1eKnCexocKZFch.png','uploads/catalog/art-egg/JweSyF165JjE7GOB8wCD7q6MbaNuU01bC0J01OZ8.png',NULL,'{\"en\":\"<p>art_egg</p>\"}',0,'scene_item',3,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 10:45:43','2025-09-11 22:04:24',NULL,NULL,'normal'),(25,1,NULL,'{\"en\":\"art_crown\"}','art_crown','uploads/catalog/art-crown/IhOmrPCKYNc6jbXSvzefBkG1n1QRODVfc9eeJMRb.png','uploads/catalog/art-crown/VlIGCsGZShdgAFd0ocdzAYo07eooCi6t315YOMfJ.png',NULL,'{\"en\":\"<p>art_crown</p>\"}',0,'scene_item',3,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 10:46:17','2025-09-11 22:04:34',NULL,NULL,'normal'),(26,1,NULL,'{\"en\":\"art_beret\"}','art_beret','uploads/catalog/art-beret/BVLfoD4zVRjCFQRG6ippOgBhxtBce05X65b0r6Eg.png','uploads/catalog/art-beret/u1ihr95uTibCcNEnMTnzE7bBobgwurShBzRhddxC.png',NULL,'{\"en\":\"<p>art_beret</p>\"}',0,'scene_item',3,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 10:46:56','2025-09-11 22:04:41',NULL,NULL,'normal'),(29,1,NULL,'{\"en\":\"Nieve_Galletas\"}','Nieve_Galletas','uploads/catalog/nieve-galletas/Zc22I2MMUEnJLiLIoXNo4gGxxXoSddYbsDyZqTc5.png','uploads/catalog/nieve-galletas/p5dVJ9eQyKyKS8fTXVQSLH4rPyPhYCUklYfwvAJd.png',NULL,'{\"en\":\"<p>Nieve_Galletas</p>\"}',0,'scene_item',2,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 11:44:48','2025-09-11 18:53:43',NULL,NULL,'normal'),(33,1,NULL,'{\"en\":\"cabeza_bote_rasta\"}','cabeza_bote_rasta','uploads/catalog/cabeza-bote-rasta/YNwLkhUDiGGShpjZNqgqOgErNyAEgKcI90vLUTSM.png','uploads/catalog/cabeza-bote-rasta/Za3Pa62PoBgvD0cBWE8lTfJXTFH7ajFbqVi67hHX.webm',NULL,'{\"en\":\"<p>cabeza_bote_rasta</p>\"}',0,'scene_item',4,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 18:44:38','2025-09-11 19:05:09',103,120,'normal'),(34,1,NULL,'{\"en\":\"cabeza_bote_ninja\"}','cabeza_bote_ninja','uploads/catalog/cabeza-bote-ninja/QnNyVvhu4TXpq4C931aOXrxck1XdRCo6hC5pmqA7.png','uploads/catalog/cabeza-bote-ninja/83zicDflxnB8z605cxsC79IVQkqs05z5yntyCZjz.webm',NULL,'{\"en\":\"<p>cabeza_bote_ninja</p>\"}',0,'scene_item',4,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 18:47:33','2025-09-11 19:05:16',103,120,'normal'),(35,1,NULL,'{\"en\":\"cabeza_bote_modern\"}','cabeza_bote_modern','uploads/catalog/cabeza-bote-modern/RleDEyjie0meiTsPhFhgdbE2HZPmh61c43pA4NEn.png','uploads/catalog/cabeza-bote-modern/bqNsg2MmycSt3HiHwuyk7PorIiR5itsjl7mZnwhg.webm',NULL,'{\"en\":\"<p>cabeza_bote_modern</p>\"}',0,'scene_item',4,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 18:52:34','2025-09-11 19:05:26',103,120,'normal'),(36,1,NULL,'{\"en\":\"cabeza_bote_marsu\"}','cabeza_bote_marsu','uploads/catalog/cabeza-bote-marsu/zp8FFGlqdCm6DUFHCAbAEDs9sNaj2oKl8d0qfINc.png','uploads/catalog/cabeza-bote-marsu/XfVSLeXTgN8IPqtMQ1mfVxFbRrHXJQxWwwPJ4rTO.webm',NULL,'{\"en\":\"<p>cabeza_bote_marsu</p>\"}',0,'scene_item',4,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 18:54:33','2025-09-11 19:05:36',103,120,'normal'),(37,1,NULL,'{\"en\":\"cabeza_bote_calavera\"}','cabeza_bote_calavera','uploads/catalog/cabeza-bote-calavera/riFIFCrrcy2qteZFiaWFMRHIRTmUIbQhpxhptyzr.png','uploads/catalog/cabeza-bote-calavera/8RYCfUCDqtcp8wtXzIzfZoUnmVvOLxteSOC0tjhv.webm',NULL,'{\"en\":\"<p>cabeza_bote_calavera</p>\"}',0,'scene_item',4,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 19:08:59','2025-09-11 19:08:59',103,120,'normal'),(38,1,NULL,'{\"en\":\"cabeza_bote_india\"}','cabeza_bote_india','uploads/catalog/cabeza-bote-india/ie38GgBqTymfQXr4YjRVzQgPI7zlqusS8TQs7JG8.png','uploads/catalog/cabeza-bote-india/aVizqAitv6PNdGgV50OLutG9Ud6RC94Vlzy7nAJ1.webm',NULL,'{\"en\":\"<p>cabeza_bote_india</p>\"}',0,'scene_item',4,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 19:17:05','2025-09-11 19:17:05',103,120,'normal'),(39,1,NULL,'{\"en\":\"cabeza_bote_hombre_lobo\"}','cabeza_bote_hombre_lobo','uploads/catalog/cabeza-bote-hombre-lobo/YcdCkY1Q4sdRpbCAqknGk8IjPcMzMGdKsdRK57Fi.png','uploads/catalog/cabeza-bote-hombre-lobo/zT5bGTMF2RCAWGXOcphUz541ZTB6lKuS9yX1o368.webm',NULL,'{\"en\":\"<p>cabeza_bote_hombre_lobo</p>\"}',0,'scene_item',4,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 19:17:41','2025-09-11 19:17:51',103,120,'normal'),(40,1,NULL,'{\"en\":\"cabeza_bote_yayo\"}','cabeza_bote_yayo','uploads/catalog/cabeza-bote-yayo/sC2FWKSUhGxOSGBCEYqBMdeAdOApy3wN6cNZdtyJ.png','uploads/catalog/cabeza-bote-yayo/echPop4x5PKKPtlV8mawDqZxuVRB2uv8F5Zixttv.webm',NULL,'{\"en\":\"<p>cabeza_bote_yayo</p>\"}',0,'scene_item',4,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 19:19:07','2025-09-11 19:19:07',103,120,'normal'),(41,1,NULL,'{\"en\":\"cabeza_bote_gata\"}','cabeza_bote_gata','uploads/catalog/cabeza-bote-gata/oCQXV9XY0fzSSHJy5p0aP8cDOhZvZtkHpXTuMx4O.png','uploads/catalog/cabeza-bote-gata/UtKUo65Ov8o0NChoErGyOf1AISZklv8pr1SYL39k.webm',NULL,'{\"en\":\"<p>cabeza_bote_gata</p>\"}',0,'scene_item',4,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 19:21:20','2025-09-11 19:21:20',103,120,'normal'),(42,1,NULL,'{\"en\":\"cabeza_bote_empollon\"}','cabeza_bote_empollon','uploads/catalog/cabeza-bote-empollon/dixMHUdZrG2AMYdbF1XgGTCGgLssHgmXChTQdw8P.png','uploads/catalog/cabeza-bote-empollon/kapFY6y1ag1ugdtAOqTtbf01zlnfDsTYSHyy3Jap.webm',NULL,'{\"en\":\"<p>cabeza_bote_empollon</p>\"}',0,'scene_item',4,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 19:22:27','2025-09-11 19:22:27',103,120,'normal'),(43,1,NULL,'{\"en\":\"cabeza_bote_lilian\"}','cabeza_bote_lilian','uploads/catalog/cabeza-bote-lilian/VWYWlejUG75t8WeZ5nfOKPYcfNfE6HmNf32I6YLn.png','uploads/catalog/cabeza-bote-lilian/Zhsu0FPq2UwNMQFpQpm1xFetf4SdRfLUHk0rEhkO.webm',NULL,'{\"en\":\"<p>cabeza_bote_lilian</p>\"}',0,'scene_item',4,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 19:24:09','2025-09-11 19:24:09',103,120,'normal'),(44,1,NULL,'{\"en\":\"cabeza_bote_zombie\"}','cabeza_bote_zombie','uploads/catalog/cabeza-bote-zombie/01msCEBnr6JMBZ150XHwJ5mWMGEEoW2fxfqu5br7.png','uploads/catalog/cabeza-bote-zombie/9lOK2t9Qnk8ipgzI2j6xDYNn6XAiDmpxrfVuQlid.webm',NULL,'{\"en\":\"<p>cabeza_bote_zombie</p>\"}',0,'scene_item',4,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 19:24:42','2025-09-11 19:24:42',103,120,'normal'),(45,1,NULL,'{\"en\":\"cholo_bronze\"}','cholo_bronze','uploads/catalog/cholo-bronze/BAJ271DTyJO9VOTUpnHWcRF5zO6jt8ZIHNldv3IT.png','uploads/catalog/cholo-bronze/tp0xi2sWYZjmBMr6NeOscWLPD5xyxViCdy8sFajP.png',NULL,'{\"en\":\"<p>cholo_bronze</p>\"}',0,'scene_item',5,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 22:00:00','2025-09-11 22:00:00',NULL,NULL,'normal'),(46,1,NULL,'{\"en\":\"cholo_plata1\"}','cholo_plata1','uploads/catalog/cholo-plata1/4yFkQok3vP8YBB7JsI04LBe62tfKiJ2eZCYPLJdw.png','uploads/catalog/cholo-plata1/l1gjSsN7v7waz64lMTZAqn0fSexcJM1kSAPJeNRb.png',NULL,'{\"en\":\"<p>cholo_plata1</p>\"}',0,'scene_item',5,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 22:01:55','2025-09-11 22:01:55',NULL,NULL,'normal'),(47,1,NULL,'{\"en\":\"cholo_oro\"}','cholo_oro','uploads/catalog/cholo-oro/grjhUdRIwKsLKAMuSBN2aL35oFnFTz1Yce7o5YwQ.png','uploads/catalog/cholo-oro/jrnJM6MsVAs6ZNZR6Fc64gam9fuMYIQXSQklDxyC.png',NULL,'{\"en\":\"<p>cholo_oro</p>\"}',0,'scene_item',5,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 22:02:31','2025-09-11 22:02:31',NULL,NULL,'normal'),(48,1,NULL,'{\"en\":\"lilian_bronze\"}','lilian_bronze','uploads/catalog/lilian-bronze/FZRFTb7jecQtXg9zUDlq0jCq25BkoWDrHRGEKi6k.png','uploads/catalog/lilian-bronze/acmEvUn1JJHInIELxVLNZjoAQ4k9co9p7L0BDNYd.png',NULL,'{\"en\":\"<p>lilian_bronze</p>\"}',0,'scene_item',5,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 22:08:26','2025-09-11 22:08:26',NULL,NULL,'normal'),(49,1,NULL,'{\"en\":\"lilian_plata1\"}','lilian_plata1','uploads/catalog/lilian-plata1/5Yb9SXJH1AgqMOPuQq0FFeEzNhM9QNJRATb9tdEj.png','uploads/catalog/lilian-plata1/QOmNpeHJ1LBHwxLmxJ49eHzb9hEb5wcUzUIKZaCA.png',NULL,'{\"en\":\"<p>lilian_plata1</p>\"}',0,'scene_item',5,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 22:09:51','2025-09-11 22:09:51',NULL,NULL,'normal'),(50,1,NULL,'{\"en\":\"lilian_oro\"}','lilian_oro','uploads/catalog/lilian-oro/o7JbHvkK79bsWUYBGoYJgW8UTVAtte9ORRBKMKwF.png','uploads/catalog/lilian-oro/tALwFMusPie7kPsSInYwjfuZ4LZyiWWZq8JAo2sF.png',NULL,'{\"en\":\"<p>lilian_oro</p>\"}',0,'scene_item',5,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 22:14:24','2025-09-11 22:14:24',NULL,NULL,'normal'),(51,1,NULL,'{\"en\":\"empollon_bronze\"}','empollon_bronze','uploads/catalog/empollon-bronze/KPtmDebCfv7XUrEvN2K2yHN2hRaChfrOZ05MdQiW.png','uploads/catalog/empollon-bronze/HQfEvktmI8nNajRZML5fwae5tm8PXsPKsb5cUzR6.png',NULL,'{\"en\":\"<p>empollon_bronze</p>\"}',0,'scene_item',5,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 22:28:21','2025-09-11 22:28:21',NULL,NULL,'normal'),(52,1,NULL,'{\"en\":\"empollon_plata1\"}','empollon_plata1','uploads/catalog/empollon-plata1/ZnJozE6oPiIQ0LvjIAz58QhP0oT9dfBVojTSLAWX.png','uploads/catalog/empollon-plata1/JGhnaEKfnEZdkUyrekR2QhrhQclDna34btkxy9Tf.png',NULL,'{\"en\":\"<p>empollon_plata1</p>\"}',0,'scene_item',5,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 22:32:09','2025-09-11 22:32:09',NULL,NULL,'normal'),(53,1,NULL,'{\"en\":\"empollon_oro\"}','empollon_oro','uploads/catalog/empollon-oro/UXwxSgy97LlA4tiYnU0I9TFxj71t3vXMC6rpuVgC.png','uploads/catalog/empollon-oro/3IgDZ3g2Y1BYjkqNBPI2Di5jsRYiOkxdsxIgWcmU.png',NULL,'{\"en\":\"<p>empollon_oro</p>\"}',0,'scene_item',5,'golden_coins',0,NULL,'item',0,0,'[[0, 0]]',NULL,NULL,2,1,1,1,1,10,0,0,1,NULL,NULL,NULL,NULL,'2025-09-11 22:32:40','2025-09-11 22:32:40',NULL,NULL,'normal');
/*!40000 ALTER TABLE `catalog_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_scores`
--

DROP TABLE IF EXISTS `event_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_scores` (
  `id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `event_id` bigint unsigned NOT NULL,
  `score` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_scores`
--

LOCK TABLES `event_scores` WRITE;
/*!40000 ALTER TABLE `event_scores` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `islands`
--

DROP TABLE IF EXISTS `islands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `islands` (
  `id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_uppercut_active` tinyint(1) NOT NULL DEFAULT '0',
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `islands`
--

LOCK TABLES `islands` WRITE;
/*!40000 ALTER TABLE `islands` DISABLE KEYS */;
/*!40000 ALTER TABLE `islands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `islands_config`
--

DROP TABLE IF EXISTS `islands_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `islands_config` (
  `id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `islands_config`
--

LOCK TABLES `islands_config` WRITE;
/*!40000 ALTER TABLE `islands_config` DISABLE KEYS */;
INSERT INTO `islands_config` VALUES (1,'Isla Canarias','uploads/island/isla-canarias/fAeGT6ITL8qy8y9M5TDViqcgcTlvTljRDODBuwsx.webp',1,'2025-10-31 06:31:34','2025-10-31 06:31:34'),(2,'Isla Vulcano','uploads/island/isla-vulcano/jFBqt4gp8lbnv1UrJkX0vcrwCeTDDujvy30c6mIK.webp',1,'2025-10-31 06:31:45','2025-11-02 08:53:17'),(3,'Isla Hielo','uploads/island/isla-hielo/lUaGETinvHlIcFQ1O4tCBXhZjEkMPPwiyLvrkSmf.webp',0,'2025-10-31 06:31:57','2025-10-31 06:31:57'),(4,'Isla Desierto','uploads/island/isla-desierto/PslQkJZ0Wv8yNSspvCqlzKucoiqRAp8YlcTRylP6.webp',0,'2025-10-31 06:32:07','2025-10-31 06:32:07'),(5,'Isla Murciélago','uploads/island/isla-murcielago/lEvCBgM1OgIpIuYEb4xTSH1SaZ7br6LIT2vUoDVG.webp',0,'2025-10-31 06:32:16','2025-10-31 06:32:16'),(6,'Monttawa Reef','uploads/island/monttawa-reef/bQJShYn03ungmnZEOJKjLyLib8LPcJgO3KJJIQgI.webp',1,'2025-11-02 09:40:42','2025-11-02 09:40:42');
/*!40000 ALTER TABLE `islands_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
INSERT INTO `jobs` VALUES (5,'default','{\"uuid\":\"61d31637-5df0-48e5-a45b-1f213ed292f4\",\"displayName\":\"App\\\\Jobs\\\\RestartServerJob\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"App\\\\Jobs\\\\RestartServerJob\",\"command\":\"O:25:\\\"App\\\\Jobs\\\\RestartServerJob\\\":0:{}\"},\"createdAt\":1758566649,\"delay\":null}',0,NULL,1758566649,1758566649),(6,'default','{\"uuid\":\"c02c24b6-a3a6-4818-80f2-b2dd2e43a12b\",\"displayName\":\"App\\\\Jobs\\\\RestartServerJob\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"App\\\\Jobs\\\\RestartServerJob\",\"command\":\"O:25:\\\"App\\\\Jobs\\\\RestartServerJob\\\":0:{}\"},\"createdAt\":1762375575,\"delay\":null}',0,NULL,1762375575,1762375575);
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mail_recipients`
--

DROP TABLE IF EXISTS `mail_recipients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mail_recipients` (
  `id` bigint unsigned NOT NULL,
  `mail_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `is_claimed` tinyint(1) NOT NULL DEFAULT '0',
  `claimed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mail_recipients`
--

LOCK TABLES `mail_recipients` WRITE;
/*!40000 ALTER TABLE `mail_recipients` DISABLE KEYS */;
/*!40000 ALTER TABLE `mail_recipients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mail_rewards`
--

DROP TABLE IF EXISTS `mail_rewards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mail_rewards` (
  `id` bigint unsigned NOT NULL,
  `mail_id` bigint unsigned NOT NULL,
  `catalog_item_id` bigint unsigned NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mail_rewards`
--

LOCK TABLES `mail_rewards` WRITE;
/*!40000 ALTER TABLE `mail_rewards` DISABLE KEYS */;
/*!40000 ALTER TABLE `mail_rewards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mails`
--

DROP TABLE IF EXISTS `mails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mails` (
  `id` bigint unsigned NOT NULL,
  `title` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `send_to_all` tinyint(1) NOT NULL DEFAULT '0',
  `is_persistent` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si es true, los nuevos usuarios pueden ver correos enviados antes de su registro',
  `gold_coins` int DEFAULT '0',
  `silver_coins` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mails`
--

LOCK TABLES `mails` WRITE;
/*!40000 ALTER TABLE `mails` DISABLE KEYS */;
INSERT INTO `mails` VALUES (1,'{\"en\":\"Welcome to BoomMania!\",\"zh\":\"欢迎来到BoomMania！\",\"ja\":\"BoomManiaへようこそ！\",\"ko\":\"BoomMania에 오신 것을 환영합니다!\",\"ru\":\"Добро пожаловать в BoomMania!\",\"es\":\"¡Bienvenido a BoomMania!\"}','{\"en\":\"<p>Thank you for joining our community! ?<br>As a welcome gift, we’ve added <strong>10,000 silver credits</strong> to your account so you can start your adventure in BoomMania.<br>Have fun, explore, and enjoy!</p>\",\"zh\":\"<p>感谢您加入我们的社区！?<br>作为欢迎礼，我们已为您添加了 <strong>10,000 银币积分</strong>，让您开启在BoomMania的冒险旅程。<br>尽情探索并享受游戏吧！</p>\",\"ja\":\"<p>コミュニティに参加していただきありがとうございます！?<br>ウェルカムギフトとして、<strong>10,000シルバークレジット</strong>をプレゼントしました。<br>BoomManiaの世界で冒険を始めましょう！楽しんでくださいね！</p>\",\"ko\":\"<p>우리 커뮤니티에 참여해 주셔서 감사합니다! ?<br>환영 선물로 <strong>10,000 실버 크레딧</strong>을 드렸습니다.<br>지금 바로 BoomMania에서 모험을 시작하세요! 즐겁게 플레이하세요!</p>\",\"ru\":\"<p>Спасибо, что присоединились к нашему сообществу! ?<br>В качестве приветственного подарка мы начислили вам <strong>10 000 серебряных кредитов</strong>, чтобы вы могли начать своё приключение в BoomMania.<br>Наслаждайтесь игрой и удачи вам в пути!</p>\",\"es\":\"<p>¡Gracias por unirte a nuestra comunidad! ?<br>Como regalo de bienvenida, te hemos enviado <strong>10.000 créditos de plata</strong> para que comiences tu aventura en BoomMania.<br>¡Disfruta, explora y diviértete!</p>\"}',1,1,1,0,10000,'2025-11-03 07:04:00','2025-11-03 07:24:57');
/*!40000 ALTER TABLE `mails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2020_03_31_114745_remove_backpackuser_model',1),(5,'2025_03_14_061615_create_table_public_scenes_table',1),(6,'2025_03_14_063440_create_permission_tables',1),(7,'2025_03_15_124714_create_oauth_auth_codes_table',1),(8,'2025_03_15_124715_create_oauth_access_tokens_table',1),(9,'2025_03_15_124716_create_oauth_refresh_tokens_table',1),(10,'2025_03_15_124717_create_oauth_clients_table',1),(11,'2025_03_15_124718_create_oauth_personal_access_clients_table',1),(12,'2025_04_03_051617_add_is_bot_to_users_table',1),(13,'2025_05_05_053140_create_minigame_scenes_table',1),(14,'2025_05_27_052810_create_scene_items_table',1),(15,'2025_05_27_053633_create_public_scene_scene_items_table',1),(16,'2025_07_07_133806_create_islands_table',1),(17,'2025_07_10_053935_create_private_scene_configs_table',1),(18,'2025_07_10_053940_create_private_scenes_table',1),(19,'2025_07_14_075232_create_catalog_categories_table',1),(20,'2025_07_14_075500_create_catalog_items_table',1),(21,'2025_07_14_080757_create_user_catalog_items_table',1),(22,'2025_07_18_094448_create_ranking_categories_table',1),(23,'2025_07_18_094647_create_rankings_table',1),(24,'2025_07_18_095000_create_ranking_summary_view',1),(25,'2025_08_11_194350_add_description_to_users_table',2),(26,'2025_08_12_081153_add_ficha_to_users_table',3),(27,'2025_08_12_183829_add_user_fields_to_public_scene_items_table',4),(28,'2025_08_12_190642_add_index_to_public_scene_items_table',4),(29,'2025_08_14_145805_create_user_fichas_table',5),(30,'2025_08_16_135206_create_user_chats_table',6),(31,'2025_08_17_083723_create_user_colornames_table',7),(32,'2025_08_17_084034_create_user_shadows_table',7),(33,'2025_08_19_051501_add_catch_file_name_to_scene_items_table',8),(34,'2025_08_23_093120_add_fields_1_to_catalog_items_table',9),(35,'2025_08_26_111522_add_decoration_fields_to_catalog_items_table',9),(36,'2025_08_26_112303_add_show_in_inventory_to_user_catalog_items_table',9),(37,'2025_08_27_123505_users_tables',9),(38,'2025_08_29_104001_add_dimensions_to_catalog_items_table',10),(39,'2025_08_29_180527_add_data_to_user_catalog_items_table',10),(40,'2025_08_31_085542_add_lang_to_users_table',10),(41,'2025_08_31_112931_add_setting_fields_to_users_table',10),(42,'2025_09_05_074428_add_assets_data_to_public_scenes_table',11),(43,'2025_09_05_121653_create_npcs_table',11),(44,'2025_09_05_122249_add_npc_id_to_public_scenes_table',11),(45,'2025_09_08_063150_add_files_to_scene_items_table',11),(46,'2025_09_08_111539_add_user_id_to_catalog_items_table',12),(47,'2025_09_12_051829_add_type_of_behavior_to_catalog_items_table',13),(48,'2025_09_13_072305_create_scene_arrows_table',14),(49,'2025_09_13_073803_add_arrows_to_public_scenes_table',14),(50,'2025_09_17_051918_add_scale_to_npcs_table',15),(51,'2025_09_17_054925_add_scale_to_catalog_items_table',15),(52,'2025_09_17_060155_add_scale_to_scene_arrows_table',15),(53,'2025_10_06_050605_create_api_keys_table',16),(54,'2025_10_07_000002_create_bot_messages_table',16),(55,'2025_10_07_000003_create_bot_summaries_table',16),(56,'2025_10_07_000004_create_bot_facts_table',16),(57,'2025_10_07_062200_remove_room_id_from_bot_summaries_table',16),(58,'2025_10_07_062234_add_user_id_to_bot_summaries_table',16),(59,'2025_10_07_100000_add_bot_config_to_users_table',16),(60,'2025_10_12_065522_add_sound_to_public_scenes_table',17),(61,'2025_10_12_143702_add_scene_sound_phaser_to_users_table',17),(62,'2025_10_13_052542_add_darkening_to_public_scenes_table',17),(63,'2025_10_15_114808_add_big_area_to_public_scenes_table',18),(64,'2025_10_19_114602_remove_rankings_tables',18),(65,'2025_10_20_062537_create_events_table',18),(66,'2025_10_20_062904_create_event_scores_table',18),(67,'2025_10_20_063516_create_minigames_table',18),(68,'2025_10_20_063829_create_minigame_weeks_table',18),(69,'2025_10_20_064041_create_minigame_scores_table',18),(70,'2025_10_20_064341_create_rewards_table',18),(71,'2025_10_20_070225_add_event_id_to_public_scene_items_table',18),(72,'2025_10_24_155108_add_type_to_minigames_table',19),(73,'2025_10_27_063731_create_islands_config_table',20),(74,'2025_10_28_071732_add_data_to_private_scene_configs_table',20),(75,'2025_11_02_124120_create_mails_table',21),(76,'2025_11_02_124128_create_mail_recipients_table',21),(77,'2025_11_02_124131_create_mail_rewards_table',21),(78,'2025_11_03_070834_update_title_in_mails_table',22),(79,'2025_11_04_071900_add_show_username_to_users_table',23),(80,'2025_11_04_173400_create_npc_catalog_items_table',24),(81,'2025_11_04_173500_create_catalog_item_requirements_table',24),(82,'2025_11_05_110236_add_multi_buy_to_catalog_items_table',24),(83,'2025_11_06_065115_add_catalog_item_id_to_public_scene_items_table',25),(84,'2025_11_21_161600_add_interactions_stats_to_users_table',26),(85,'2025_11_22_165500_create_public_scene_traps_table',27),(86,'2025_11_25_063200_add_big_scene_to_private_scene_configs_table',28),(87,'2025_11_27_120000_add_lobby_tutorial_to_users_table',29),(88,'2025_12_01_000000_add_stripe_and_reward_fields_to_catalog_items_table',30),(89,'2025_12_01_000001_update_price_type_enum_in_catalog_items_table',30),(90,'2025_12_03_000000_add_quantity_limits_to_catalog_items_table',30);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `minigame_scenes`
--

DROP TABLE IF EXISTS `minigame_scenes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `minigame_scenes` (
  `id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` int NOT NULL,
  `map_width` int NOT NULL DEFAULT '30',
  `map_height` int NOT NULL DEFAULT '30',
  `map` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `position_users` text COLLATE utf8mb4_unicode_ci,
  `start_x` int NOT NULL DEFAULT '11',
  `start_y` int NOT NULL DEFAULT '11',
  `start_z` int NOT NULL DEFAULT '2',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `minigame_scenes`
--

LOCK TABLES `minigame_scenes` WRITE;
/*!40000 ALTER TABLE `minigame_scenes` DISABLE KEYS */;
INSERT INTO `minigame_scenes` VALUES (1,'Golden Ring',1,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]','[[11,11,2],[14,8,2],[14,6,2],[12,6,2],[9,9,2],[6,12,2],[6,14,2],[8,14,2]]',6,30,2,1,'2025-05-05 05:51:51','2025-05-05 05:51:51');
/*!40000 ALTER TABLE `minigame_scenes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `minigame_scores`
--

DROP TABLE IF EXISTS `minigame_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `minigame_scores` (
  `id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `minigame_week_id` bigint unsigned NOT NULL,
  `minigame_id` bigint unsigned NOT NULL,
  `score` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `minigame_scores`
--

LOCK TABLES `minigame_scores` WRITE;
/*!40000 ALTER TABLE `minigame_scores` DISABLE KEYS */;
INSERT INTO `minigame_scores` VALUES (2,5,1,1,166,'2025-10-24 07:14:24','2025-10-26 23:44:39'),(3,6,1,1,172,'2025-10-24 07:16:02','2025-10-26 23:30:24'),(4,8,1,1,173,'2025-10-24 07:23:20','2025-10-26 23:35:28'),(5,4,1,1,205,'2025-10-24 07:25:19','2025-10-26 23:25:22'),(7,7,1,1,188,'2025-10-24 07:32:18','2025-10-26 23:55:53'),(9,3,1,1,170,'2025-10-24 07:50:40','2025-10-26 23:31:56'),(13,8,2,2,5,'2025-10-25 21:49:44','2025-10-26 18:32:18'),(14,3,2,2,1,'2025-10-26 09:28:42','2025-10-26 09:28:42'),(16,4,2,2,2,'2025-10-26 11:55:02','2025-10-26 12:25:09'),(17,5,2,2,1,'2025-10-26 17:51:43','2025-10-26 17:51:43'),(18,7,2,2,1,'2025-10-26 18:42:11','2025-10-26 18:42:11'),(22,6,3,1,313,'2025-11-03 17:39:17','2025-11-09 23:53:05'),(23,5,3,1,294,'2025-11-03 17:43:33','2025-11-09 22:37:54'),(25,7,3,1,381,'2025-11-03 17:51:16','2025-11-09 19:44:07'),(26,8,3,1,332,'2025-11-03 17:53:23','2025-11-09 23:48:50'),(27,4,3,1,321,'2025-11-03 18:54:24','2025-11-09 23:39:40'),(28,3,3,1,323,'2025-11-03 19:19:02','2025-11-09 23:21:03'),(33,6,4,2,1,'2025-11-05 17:22:26','2025-11-05 17:22:26'),(34,7,4,2,1,'2025-11-09 08:49:35','2025-11-09 08:49:35'),(35,3,5,1,514,'2025-11-10 00:13:48','2025-11-16 23:58:34'),(37,4,5,1,590,'2025-11-10 00:19:40','2025-11-16 23:47:50'),(38,5,5,1,648,'2025-11-10 00:25:13','2025-11-16 23:45:52'),(42,6,5,1,549,'2025-11-10 01:52:44','2025-11-16 23:56:47'),(43,7,5,1,535,'2025-11-10 01:54:58','2025-11-16 23:52:08'),(45,8,5,1,458,'2025-11-10 05:44:47','2025-11-16 23:55:11'),(47,4,7,1,590,'2025-11-17 00:00:49','2025-11-23 23:34:54'),(48,3,7,1,620,'2025-11-17 00:02:28','2025-11-23 23:50:47'),(49,5,7,1,626,'2025-11-17 00:04:44','2025-11-23 23:45:38'),(50,7,7,1,477,'2025-11-17 00:06:40','2025-11-23 23:58:48'),(51,6,7,1,466,'2025-11-17 00:17:50','2025-11-23 23:53:08'),(55,8,7,1,594,'2025-11-17 00:49:04','2025-11-23 23:19:10'),(59,6,8,2,1,'2025-11-22 15:55:17','2025-11-22 15:55:17'),(61,5,9,1,571,'2025-11-24 00:00:47','2025-11-30 23:44:11'),(63,8,9,1,539,'2025-11-24 00:04:35','2025-11-30 22:59:11'),(64,7,9,1,550,'2025-11-24 00:09:19','2025-11-30 23:59:57'),(66,6,9,1,575,'2025-11-24 00:19:48','2025-11-30 23:58:37'),(67,3,9,1,600,'2025-11-24 00:33:07','2025-11-30 23:42:43'),(69,4,9,1,606,'2025-11-24 00:55:12','2025-11-30 23:54:50'),(73,4,10,2,1,'2025-11-26 08:12:18','2025-11-26 08:12:18'),(75,3,11,1,545,'2025-12-01 00:02:18','2025-12-07 23:59:34'),(76,5,11,1,558,'2025-12-01 00:04:20','2025-12-07 23:53:37'),(77,4,11,1,663,'2025-12-01 00:06:57','2025-12-07 23:47:39'),(78,8,11,1,526,'2025-12-01 00:09:02','2025-12-07 23:42:23'),(81,6,11,1,467,'2025-12-01 00:30:50','2025-12-07 23:55:40'),(82,7,11,1,496,'2025-12-01 00:32:30','2025-12-07 23:51:28'),(87,7,12,2,1,'2025-12-01 12:59:03','2025-12-01 12:59:03'),(88,8,13,1,616,'2025-12-08 00:01:17','2025-12-14 23:32:13'),(92,7,13,1,400,'2025-12-08 00:14:19','2025-12-14 23:23:32'),(94,4,13,1,489,'2025-12-08 00:30:43','2025-12-14 23:56:20'),(95,3,13,1,587,'2025-12-08 00:44:12','2025-12-14 23:48:50'),(96,5,13,1,611,'2025-12-08 00:46:16','2025-12-14 23:58:03'),(97,6,13,1,533,'2025-12-08 00:55:39','2025-12-14 23:22:07'),(100,3,14,2,1,'2025-12-09 07:03:21','2025-12-09 07:03:21'),(101,7,15,1,497,'2025-12-15 00:00:21','2025-12-21 23:41:47'),(102,5,15,1,560,'2025-12-15 00:04:13','2025-12-21 23:39:32'),(104,6,15,1,505,'2025-12-15 00:06:22','2025-12-21 23:56:51'),(105,8,15,1,569,'2025-12-15 00:09:03','2025-12-21 23:37:35'),(106,3,15,1,563,'2025-12-15 00:10:47','2025-12-21 23:33:05'),(109,4,15,1,527,'2025-12-15 00:33:16','2025-12-21 23:44:11'),(113,8,17,1,546,'2025-12-22 00:00:35','2025-12-28 23:25:09'),(114,7,17,1,465,'2025-12-22 00:04:39','2025-12-28 23:10:29'),(115,4,17,1,498,'2025-12-22 00:06:38','2025-12-28 23:33:58'),(119,6,17,1,541,'2025-12-22 00:18:48','2025-12-28 23:15:06'),(120,5,17,1,483,'2025-12-22 00:29:38','2025-12-28 23:55:02'),(122,3,17,1,642,'2025-12-22 00:47:16','2025-12-28 23:36:44'),(127,6,19,1,498,'2025-12-29 00:04:18','2026-01-04 23:32:27'),(128,4,19,1,458,'2025-12-29 00:06:13','2026-01-04 23:48:33'),(129,7,19,1,385,'2025-12-29 00:09:55','2026-01-04 23:54:42'),(130,3,19,1,491,'2025-12-29 00:11:50','2026-01-04 23:53:10'),(133,8,19,1,415,'2025-12-29 00:33:53','2026-01-04 23:58:58'),(136,5,19,1,464,'2025-12-29 01:47:15','2026-01-04 23:50:32'),(139,7,20,2,10,'2025-12-31 14:44:18','2026-01-01 08:31:52'),(141,6,20,2,7,'2025-12-31 15:56:41','2026-01-01 05:03:40'),(142,3,20,2,5,'2025-12-31 17:02:57','2026-01-01 08:40:53'),(143,8,20,2,9,'2025-12-31 17:21:12','2026-01-01 06:09:59'),(144,5,20,2,12,'2025-12-31 17:39:16','2026-01-01 10:14:24'),(146,4,20,2,11,'2025-12-31 18:27:20','2026-01-01 09:35:11'),(147,3,21,1,490,'2026-01-05 00:01:02','2026-01-11 23:55:27'),(149,6,21,1,607,'2026-01-05 00:07:34','2026-01-11 23:33:53'),(152,4,21,1,559,'2026-01-05 00:17:23','2026-01-11 23:21:23'),(154,5,21,1,579,'2026-01-05 00:22:03','2026-01-11 23:52:34'),(155,8,21,1,484,'2026-01-05 00:26:31','2026-01-11 23:48:45'),(157,7,21,1,458,'2026-01-05 01:24:57','2026-01-11 23:29:58'),(159,5,23,1,512,'2026-01-12 00:00:35','2026-01-18 23:52:56'),(160,7,23,1,495,'2026-01-12 00:04:33','2026-01-18 22:48:18'),(161,4,23,1,550,'2026-01-12 00:08:45','2026-01-18 23:36:41'),(163,6,23,1,571,'2026-01-12 00:12:44','2026-01-18 23:46:44'),(164,8,23,1,479,'2026-01-12 00:15:01','2026-01-18 23:56:46'),(166,3,23,1,520,'2026-01-12 00:30:58','2026-01-18 23:59:13'),(170,7,25,1,276,'2026-01-19 00:02:45','2026-01-23 07:18:19'),(171,6,25,1,318,'2026-01-19 00:04:41','2026-01-23 07:53:59'),(172,4,25,1,255,'2026-01-19 00:07:08','2026-01-23 07:46:11'),(175,8,25,1,273,'2026-01-19 00:19:05','2026-01-23 06:54:42'),(177,5,25,1,273,'2026-01-19 00:47:07','2026-01-23 07:42:01'),(178,3,25,1,267,'2026-01-19 00:57:31','2026-01-23 07:35:16'),(182,4,26,2,25,'2026-01-23 08:33:43','2026-01-25 23:55:17'),(184,6,26,2,17,'2026-01-23 09:25:00','2026-01-25 20:26:54'),(186,7,26,2,25,'2026-01-23 09:55:06','2026-01-25 21:45:15'),(187,3,26,2,20,'2026-01-23 09:58:10','2026-01-25 14:51:37'),(188,8,26,2,34,'2026-01-23 11:28:40','2026-01-25 23:34:08'),(189,5,26,2,16,'2026-01-23 12:31:44','2026-01-25 23:25:09'),(191,8,27,2,3,'2026-01-26 00:10:21','2026-01-26 08:10:59'),(192,6,27,2,2,'2026-01-26 00:37:33','2026-01-26 06:25:06'),(193,4,27,2,5,'2026-01-26 00:43:41','2026-01-26 08:26:06'),(195,7,27,2,2,'2026-01-26 01:16:49','2026-01-26 02:17:23'),(196,3,27,2,3,'2026-01-26 01:50:11','2026-01-26 04:42:36'),(197,5,27,2,4,'2026-01-26 02:32:26','2026-01-26 07:07:25'),(202,4,28,1,243,'2026-01-26 09:27:29','2026-01-31 16:16:16'),(203,3,28,1,370,'2026-01-26 09:30:24','2026-01-31 16:28:10'),(204,7,28,1,214,'2026-01-26 09:33:37','2026-01-31 14:42:58'),(207,6,28,1,388,'2026-01-26 09:51:12','2026-01-31 16:25:22'),(209,5,28,1,322,'2026-01-26 09:57:43','2026-01-31 15:28:05'),(210,8,28,1,251,'2026-01-26 10:09:51','2026-01-31 15:58:18');
/*!40000 ALTER TABLE `minigame_scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `minigame_weeks`
--

DROP TABLE IF EXISTS `minigame_weeks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `minigame_weeks` (
  `id` bigint unsigned NOT NULL,
  `minigame_id` bigint unsigned NOT NULL,
  `week_number` int NOT NULL,
  `year` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `minigame_weeks`
--

LOCK TABLES `minigame_weeks` WRITE;
/*!40000 ALTER TABLE `minigame_weeks` DISABLE KEYS */;
INSERT INTO `minigame_weeks` VALUES (1,1,43,2025,'2025-10-20','2025-10-27','2025-10-24 07:08:41','2025-10-24 07:08:41'),(2,2,43,2025,'2025-10-20','2025-10-27','2025-10-25 07:23:21','2025-10-25 07:23:21'),(3,1,45,2025,'2025-11-03','2025-11-10','2025-11-03 17:32:58','2025-11-03 17:32:58'),(4,2,45,2025,'2025-11-03','2025-11-10','2025-11-03 22:39:13','2025-11-03 22:39:13'),(5,1,46,2025,'2025-11-10','2025-11-17','2025-11-10 00:13:48','2025-11-10 00:13:48'),(6,2,46,2025,'2025-11-10','2025-11-17','2025-11-10 01:48:34','2025-11-10 01:48:34'),(7,1,47,2025,'2025-11-17','2025-11-24','2025-11-17 00:00:49','2025-11-17 00:00:49'),(8,2,47,2025,'2025-11-17','2025-11-24','2025-11-17 00:34:51','2025-11-17 00:34:51'),(9,1,48,2025,'2025-11-24','2025-12-01','2025-11-24 00:00:47','2025-11-24 00:00:47'),(10,2,48,2025,'2025-11-24','2025-12-01','2025-11-24 01:05:16','2025-11-24 01:05:16'),(11,1,49,2025,'2025-12-01','2025-12-08','2025-12-01 00:02:18','2025-12-01 00:02:18'),(12,2,49,2025,'2025-12-01','2025-12-08','2025-12-01 00:33:55','2025-12-01 00:33:55'),(13,1,50,2025,'2025-12-08','2025-12-15','2025-12-08 00:01:17','2025-12-08 00:01:17'),(14,2,50,2025,'2025-12-08','2025-12-15','2025-12-08 00:04:08','2025-12-08 00:04:08'),(15,1,51,2025,'2025-12-15','2025-12-22','2025-12-15 00:00:21','2025-12-15 00:00:21'),(16,2,51,2025,'2025-12-15','2025-12-22','2025-12-15 00:04:49','2025-12-15 00:04:49'),(17,1,52,2025,'2025-12-22','2025-12-29','2025-12-22 00:00:35','2025-12-22 00:00:35'),(18,2,52,2025,'2025-12-22','2025-12-29','2025-12-22 00:14:24','2025-12-22 00:14:24'),(19,1,1,2025,'2025-12-29','2026-01-05','2025-12-29 00:01:10','2025-12-29 00:01:10'),(20,2,1,2025,'2025-12-29','2026-01-05','2025-12-29 00:16:29','2025-12-29 00:16:29'),(21,1,2,2026,'2026-01-05','2026-01-12','2026-01-05 00:01:02','2026-01-05 00:01:02'),(22,2,2,2026,'2026-01-05','2026-01-12','2026-01-05 00:08:03','2026-01-05 00:08:03'),(23,1,3,2026,'2026-01-12','2026-01-19','2026-01-12 00:00:35','2026-01-12 00:00:35'),(24,2,3,2026,'2026-01-12','2026-01-19','2026-01-12 01:12:32','2026-01-12 01:12:32'),(25,1,4,2026,'2026-01-19','2026-01-26','2026-01-19 00:02:45','2026-01-19 00:02:45'),(26,2,4,2026,'2026-01-19','2026-01-26','2026-01-19 01:01:49','2026-01-19 01:01:49'),(27,2,5,2026,'2026-01-26','2026-02-02','2026-01-26 00:10:21','2026-01-26 00:10:21'),(28,1,5,2026,'2026-01-26','2026-02-02','2026-01-26 09:27:29','2026-01-26 09:27:29');
/*!40000 ALTER TABLE `minigame_weeks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `minigames`
--

DROP TABLE IF EXISTS `minigames`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `minigames` (
  `id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `minigames`
--

LOCK TABLES `minigames` WRITE;
/*!40000 ALTER TABLE `minigames` DISABLE KEYS */;
INSERT INTO `minigames` VALUES (1,'{\"en\":\"Ring\"}',NULL,'2025-10-24 07:08:41','2025-10-25 07:23:26','ring'),(2,'{\"en\":\"Crazy Coconuts\",\"zh\":\"疯狂椰子\",\"ja\":\"クレイジーココナッツ\",\"ko\":\"크레이지 코코넛\",\"ru\":\"Безумные Кокосы\",\"es\":\"Cocos Locos\"}',NULL,'2025-10-25 07:23:21','2025-10-25 07:24:17','crazy_coconuts');
/*!40000 ALTER TABLE `minigames` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `model_has_permissions`
--

DROP TABLE IF EXISTS `model_has_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `model_has_permissions` (
  `permission_id` bigint unsigned NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint unsigned NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model_has_permissions`
--

LOCK TABLES `model_has_permissions` WRITE;
/*!40000 ALTER TABLE `model_has_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `model_has_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `model_has_roles`
--

DROP TABLE IF EXISTS `model_has_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `model_has_roles` (
  `role_id` bigint unsigned NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint unsigned NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model_has_roles`
--

LOCK TABLES `model_has_roles` WRITE;
/*!40000 ALTER TABLE `model_has_roles` DISABLE KEYS */;
INSERT INTO `model_has_roles` VALUES (3,'App\\Models\\User',3),(3,'App\\Models\\User',4),(3,'App\\Models\\User',5),(3,'App\\Models\\User',6),(3,'App\\Models\\User',7),(3,'App\\Models\\User',8);
/*!40000 ALTER TABLE `model_has_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `npc_catalog_items`
--

DROP TABLE IF EXISTS `npc_catalog_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `npc_catalog_items` (
  `id` bigint unsigned NOT NULL,
  `npc_id` bigint unsigned NOT NULL,
  `catalog_item_id` bigint unsigned NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `npc_catalog_items`
--

LOCK TABLES `npc_catalog_items` WRITE;
/*!40000 ALTER TABLE `npc_catalog_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `npc_catalog_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `npcs`
--

DROP TABLE IF EXISTS `npcs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `npcs` (
  `id` bigint unsigned NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default',
  `stripe_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image` text COLLATE utf8mb4_unicode_ci,
  `position_x` int NOT NULL DEFAULT '0',
  `position_y` int NOT NULL DEFAULT '0',
  `depth` int NOT NULL DEFAULT '0',
  `scale` int NOT NULL DEFAULT '1',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `npcs`
--

LOCK TABLES `npcs` WRITE;
/*!40000 ALTER TABLE `npcs` DISABLE KEYS */;
INSERT INTO `npcs` VALUES (1,'ring','ring_npc','{\"en\":\"Ring\",\"es\":\"Ring\"}','{\"en\":\"<p>Ring</p>\",\"es\":\"<p>Ring</p>\"}','uploads/npc/ring/gSiLIY4nrBI9cAOHxwLZ4TmsLPTQDtgSzbhIx4Kc.webp',602,291,262,1,1,'2025-09-08 08:23:05','2025-11-05 17:41:47'),(2,'objects','cementerio_1_npc','{\"en\":\"The Gravekeeper of Styles\"}','{\"en\":\"<p>Amid the tombstones stands a mysterious gravekeeper who trades in outfits from forgotten eras. Bring him the required items to claim an exclusive costume… but beware — each outfit can only be redeemed <strong>once per soul</strong>. If you already possess it, he won’t offer it again.</p>\"}','uploads/npc/the-gravekeeper-of-styles/tHJCONtpDAy6ow8P91cAlonojFsh1TDLYMu5Dye8.png',602,291,262,2,1,'2025-11-05 11:28:16','2025-11-05 19:31:23');
/*!40000 ALTER TABLE `npcs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_access_tokens`
--

DROP TABLE IF EXISTS `oauth_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oauth_access_tokens` (
  `id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `client_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scopes` text COLLATE utf8mb4_unicode_ci,
  `revoked` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_access_tokens`
--

LOCK TABLES `oauth_access_tokens` WRITE;
/*!40000 ALTER TABLE `oauth_access_tokens` DISABLE KEYS */;
INSERT INTO `oauth_access_tokens` VALUES ('dbc0bc8ca84f7cc6e2c2a8600949ecdeb86232a73bdb526d42fc74552dfc76ec6f9121256c05cf4a',3,140,'Bot Access Token','[]',0,'2026-02-25 07:12:56','2026-02-25 07:12:56','2027-02-25 07:12:56'),('2a01643f02737e7e10da843ff439dfb4b9710229fd56ac24f6f2635ec4d27034755f04219a2f9a8e',4,140,'Bot Access Token','[]',0,'2026-02-25 07:12:56','2026-02-25 07:12:56','2027-02-25 07:12:56'),('0ff8a85de4ece1f149e848e0f9e0138cdd140d2bfca14b909248d6f61238a735c4cf548b171096ea',8,140,'Bot Access Token','[]',0,'2026-02-25 07:12:57','2026-02-25 07:12:57','2027-02-25 07:12:57'),('26749cdb7a8ac94c4a9de0032d39a27720aa3d2e88c11e7c7733f26a56347b41488d96382cab942a',5,140,'Bot Access Token','[]',0,'2026-02-25 07:12:57','2026-02-25 07:12:57','2027-02-25 07:12:57'),('eee19d06d9eadc3755e2b307a2469719c20ed3c1e652bd56dbee05d5fb4e7e9af5923e19f822cb90',6,140,'Bot Access Token','[]',0,'2026-02-25 07:12:57','2026-02-25 07:12:57','2027-02-25 07:12:57'),('9f335e8605a122e54827c9c7753a89bc922f9f1ba85894993c25827b17ef91add37aeacdd95b3d91',7,140,'Bot Access Token','[]',0,'2026-02-25 07:12:57','2026-02-25 07:12:57','2027-02-25 07:12:57');
/*!40000 ALTER TABLE `oauth_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_auth_codes`
--

DROP TABLE IF EXISTS `oauth_auth_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oauth_auth_codes` (
  `id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `client_id` bigint unsigned NOT NULL,
  `scopes` text COLLATE utf8mb4_unicode_ci,
  `revoked` tinyint(1) NOT NULL,
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_auth_codes`
--

LOCK TABLES `oauth_auth_codes` WRITE;
/*!40000 ALTER TABLE `oauth_auth_codes` DISABLE KEYS */;
/*!40000 ALTER TABLE `oauth_auth_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_clients`
--

DROP TABLE IF EXISTS `oauth_clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oauth_clients` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `secret` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `redirect` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `personal_access_client` tinyint(1) NOT NULL,
  `password_client` tinyint(1) NOT NULL,
  `revoked` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=142 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_clients`
--

LOCK TABLES `oauth_clients` WRITE;
/*!40000 ALTER TABLE `oauth_clients` DISABLE KEYS */;
INSERT INTO `oauth_clients` VALUES (1,NULL,'Laravel Personal Access Client','MhYXtu1THTrTUPNoqyeUuBZKqsZmXZDJ1myDtfhI',NULL,'http://localhost',1,0,0,'2025-08-08 11:24:20','2025-08-08 11:24:20'),(2,NULL,'Laravel Personal Access Client','aRJ2qztyZsBGKngvWDDa8fUABwf3u6vpcErU2fIL',NULL,'http://localhost',1,0,0,'2025-08-08 11:24:33','2025-08-08 11:24:33'),(3,NULL,'Laravel Password Grant Client','GZFvw2pMW6Hr6PqWPj05fhUSFPL6nlQkUluqoGd6','users','http://localhost',0,1,0,'2025-08-08 11:24:35','2025-08-08 11:24:35'),(4,NULL,'Laravel Personal Access Client','Gsl116i7OZ54netGdA4mTanDoV7OcNGAuyua1SHy',NULL,'http://localhost',1,0,0,'2025-08-10 10:04:44','2025-08-10 10:04:44'),(5,NULL,'Laravel Password Grant Client','JcPjXHJC2zEJH5jWrNJ1MfoBtC5K0oxgiUHP8Du9','users','http://localhost',0,1,0,'2025-08-10 10:04:47','2025-08-10 10:04:47'),(6,NULL,'Laravel Personal Access Client','9saUJUTBF8sEIZy8VHVKBxHFXefn6BycS9JqOBN5',NULL,'http://localhost',1,0,0,'2025-08-11 08:56:16','2025-08-11 08:56:16'),(7,NULL,'Laravel Password Grant Client','ttKziyFUl7VTEhbliq5EY6fP3VleLaHPSADcLLmi','users','http://localhost',0,1,0,'2025-08-11 08:56:17','2025-08-11 08:56:17'),(8,NULL,'Laravel Personal Access Client','qgkiIZsX28hhgAAgQ08ul5YERKHWJTRL79rjPwhw',NULL,'http://localhost',1,0,0,'2025-08-12 07:27:42','2025-08-12 07:27:42'),(9,NULL,'Laravel Password Grant Client','oLVfg1aUjUzRdM0q2jNiBeh7D0QrlFpH9ECSbmxz','users','http://localhost',0,1,0,'2025-08-12 07:27:44','2025-08-12 07:27:44'),(10,NULL,'Personal Access Client','F0lMv8Qn5tev3BE6ykKV0oJ99lVttbJGU9BZTsh9',NULL,'http://localhost',1,0,0,'2025-08-12 10:27:29','2025-08-12 10:27:29'),(11,NULL,'Password Grant Client','y2AdwRr5yRzoLnxDR1jQIDLc4r0dHeZ25fkmxKzV','users','http://localhost',0,1,0,'2025-08-12 10:27:29','2025-08-12 10:27:29'),(12,NULL,'Personal Access Client','HBDnHn92Oka3sDRVRdnXgraPrHo8Qh5yulvk8dca',NULL,'http://localhost',1,0,0,'2025-08-13 10:49:13','2025-08-13 10:49:13'),(13,NULL,'Password Grant Client','iBuREVtn8B0cuLvaZjhQ1M5zFoSFZbOSjfxI1EoK','users','http://localhost',0,1,0,'2025-08-13 10:49:13','2025-08-13 10:49:13'),(14,NULL,'Personal Access Client','dDFLEyrSCcY99atLxS8vFiOx5WxCWmvP0TwJuNgt',NULL,'http://localhost',1,0,0,'2025-08-13 10:52:32','2025-08-13 10:52:32'),(15,NULL,'Password Grant Client','lMCmnJuIweUXjGAxoCbpeuD8eKpvz6tyeVKFsLhh','users','http://localhost',0,1,0,'2025-08-13 10:52:32','2025-08-13 10:52:32'),(16,NULL,'Personal Access Client','oEjPFyCPJcRMZ2uc0ag4Xq6aZy26zMHOCxY1duHN',NULL,'http://localhost',1,0,0,'2025-08-15 19:55:38','2025-08-15 19:55:38'),(17,NULL,'Password Grant Client','I8xaVO0QXfnzvf4Jj6WS3OoAjyqV3MHu9IZ5hyoB','users','http://localhost',0,1,0,'2025-08-15 19:55:38','2025-08-15 19:55:38'),(18,NULL,'Personal Access Client','9gGeXWRa1Y0n7eJVGRwwDOWnwVL2FkZoyU4Ia76w',NULL,'http://localhost',1,0,0,'2025-08-16 17:23:51','2025-08-16 17:23:51'),(19,NULL,'Password Grant Client','NmBBDFrZtcVWAa7jqJZtIuCiMIiLDa9zZuKcQsVU','users','http://localhost',0,1,0,'2025-08-16 17:23:51','2025-08-16 17:23:51'),(20,NULL,'Personal Access Client','ck10CYpp4eiCDEdpkDskgZNXutND4m9A46lQ2KFD',NULL,'http://localhost',1,0,0,'2025-08-17 12:39:19','2025-08-17 12:39:19'),(21,NULL,'Password Grant Client','kYf5GoLgd08YmE07Ez4cDwrOvhr7JxdmArWLo8SG','users','http://localhost',0,1,0,'2025-08-17 12:39:19','2025-08-17 12:39:19'),(22,NULL,'Personal Access Client','rQfa3okUCLEJuS1tPZ7dWndcUkYyjw8hstdqKxsi',NULL,'http://localhost',1,0,0,'2025-08-18 19:16:53','2025-08-18 19:16:53'),(23,NULL,'Password Grant Client','tSgznuYTrdmET3jAX4isMWb4djnURboanB3nilMt','users','http://localhost',0,1,0,'2025-08-18 19:16:53','2025-08-18 19:16:53'),(24,NULL,'Personal Access Client','IvnsfstBLwuaE984QwOYx5TMYFNuwtLYPfr6Vxmc',NULL,'http://localhost',1,0,0,'2025-08-19 19:22:15','2025-08-19 19:22:15'),(25,NULL,'Password Grant Client','bCtkvbHfF5CO7bIUTfCWOHqGp37zSr47CVjZMtoT','users','http://localhost',0,1,0,'2025-08-19 19:22:15','2025-08-19 19:22:15'),(26,NULL,'Personal Access Client','xnnYAo6rKm1Ndu4ufKkdBxCueRn6n7PExohFFW8k',NULL,'http://localhost',1,0,0,'2025-08-19 19:23:34','2025-08-19 19:23:34'),(27,NULL,'Password Grant Client','SbgKrEK84usikaq7qUhHwSDRh3xWcTwdRNzAQ5c8','users','http://localhost',0,1,0,'2025-08-19 19:23:34','2025-08-19 19:23:34'),(28,NULL,'Personal Access Client','PE1Pob6Ia1KPGwBuHJUezgdK8jn02FpmaDS4d6bU',NULL,'http://localhost',1,0,0,'2025-08-19 20:13:44','2025-08-19 20:13:44'),(29,NULL,'Password Grant Client','ik7jswRPe9B1YvpOm5FLyVn3Dyh3cdZ7vru2gTmX','users','http://localhost',0,1,0,'2025-08-19 20:13:44','2025-08-19 20:13:44'),(30,NULL,'Personal Access Client','9JVth8v2VAJrMkUQ9qV0gC0VHrObf8a9SsXX8wjp',NULL,'http://localhost',1,0,0,'2025-08-19 21:10:45','2025-08-19 21:10:45'),(31,NULL,'Password Grant Client','HsGgqy8HouIorMkOpfo9kiUQpSPL1F7TsKAVwUuK','users','http://localhost',0,1,0,'2025-08-19 21:10:45','2025-08-19 21:10:45'),(32,NULL,'Personal Access Client','xMyxRlhY8pUxd2UML5vJFC0m64NUPrxCVSytNVeO',NULL,'http://localhost',1,0,0,'2025-08-20 12:48:35','2025-08-20 12:48:35'),(33,NULL,'Password Grant Client','Owf62mr8g1dkk4F7t4ixCs3dsSbP97yWs0Z24R1L','users','http://localhost',0,1,0,'2025-08-20 12:48:35','2025-08-20 12:48:35'),(34,NULL,'Personal Access Client','Q4GLH6mPA8DsdRPh1DgKBFU16PelV47XtSty3Q38',NULL,'http://localhost',1,0,0,'2025-08-28 05:29:21','2025-08-28 05:29:21'),(35,NULL,'Password Grant Client','rZ24lKAB9YkwMkkkQb7l4ROeuQ7Dfgxinp2iKS2Q','users','http://localhost',0,1,0,'2025-08-28 05:29:21','2025-08-28 05:29:21'),(36,NULL,'Personal Access Client','8ekT96mNxNWQI7pXOmvHZY9Y76TxbKC48G1kEtJD',NULL,'http://localhost',1,0,0,'2025-08-28 05:42:16','2025-08-28 05:42:16'),(37,NULL,'Password Grant Client','yiTusLcb0YAx7A2hGVTE2mbqERLyKUoaDebg2Ym0','users','http://localhost',0,1,0,'2025-08-28 05:42:16','2025-08-28 05:42:16'),(38,NULL,'Personal Access Client','pWTwLRD87Gd5KeqVLc3Uh49v7NeJAVuTIOHdipVN',NULL,'http://localhost',1,0,0,'2025-08-28 06:05:45','2025-08-28 06:05:45'),(39,NULL,'Password Grant Client','VrF72DwHYyH3GIce43MjVsxgfOYWCvefVLwSokgR','users','http://localhost',0,1,0,'2025-08-28 06:05:45','2025-08-28 06:05:45'),(40,NULL,'Personal Access Client','xRXKoa1G28NmjYPr0eFNXFv9vX2QOVT2JxYL8vXQ',NULL,'http://localhost',1,0,0,'2025-08-28 11:33:53','2025-08-28 11:33:53'),(41,NULL,'Password Grant Client','KCYwgyc02O0J25W7anr2AsaAX3ZuZ3cOOsnWko5V','users','http://localhost',0,1,0,'2025-08-28 11:33:53','2025-08-28 11:33:53'),(42,NULL,'Personal Access Client','zQfjPr3kOqmuR9RANlCUzLTSEy6ckJ0Kfrn7Cc9J',NULL,'http://localhost',1,0,0,'2025-08-28 11:40:15','2025-08-28 11:40:15'),(43,NULL,'Password Grant Client','jdmVgQuMEpLQGRXdEUdzXBPaCRwUg6fkcuJcEiN8','users','http://localhost',0,1,0,'2025-08-28 11:40:15','2025-08-28 11:40:15'),(44,NULL,'Personal Access Client','sjH8yXEbmJgECl0023A4GskGDCEmy8KAzzf7zMoi',NULL,'http://localhost',1,0,0,'2025-08-28 11:42:13','2025-08-28 11:42:13'),(45,NULL,'Password Grant Client','AsANOt50r2cG5DglXrXpOpHiQxhgG5hhPrToMEjE','users','http://localhost',0,1,0,'2025-08-28 11:42:13','2025-08-28 11:42:13'),(46,NULL,'Personal Access Client','AK1X0lWr4tTxTrxhYCb1qx1DdbFwA4OavwxBEhho',NULL,'http://localhost',1,0,0,'2025-08-28 11:50:03','2025-08-28 11:50:03'),(47,NULL,'Password Grant Client','Fc3SNvZFNQkogK7RQ2YF140kq2UUxzKJUsqFdnhh','users','http://localhost',0,1,0,'2025-08-28 11:50:03','2025-08-28 11:50:03'),(48,NULL,'Personal Access Client','r9eMYANJLk05bUGeR8iz464U3Sx03khCppfeRNJ7',NULL,'http://localhost',1,0,0,'2025-08-28 12:23:54','2025-08-28 12:23:54'),(49,NULL,'Password Grant Client','CSU2VH556KWuhNTLWihANW947TAxkep1hF1JCPF6','users','http://localhost',0,1,0,'2025-08-28 12:23:54','2025-08-28 12:23:54'),(50,NULL,'Personal Access Client','pexfybyKm2kxLA6cWzvqWsuLe1ycjEyNFJqYSp77',NULL,'http://localhost',1,0,0,'2025-08-28 19:56:31','2025-08-28 19:56:31'),(51,NULL,'Password Grant Client','ZHDD1ppdP3HvbzM5aIUDE1hjQemNaJmktZ39Wz7k','users','http://localhost',0,1,0,'2025-08-28 19:56:31','2025-08-28 19:56:31'),(52,NULL,'Personal Access Client','cmdZTLVJ6ZU11BY4V7JS1lshOfTkP1G84MADpuIi',NULL,'http://localhost',1,0,0,'2025-09-01 09:12:30','2025-09-01 09:12:30'),(53,NULL,'Password Grant Client','0LP5I8n1zuwPGm5S8hpIHGyvxuxVAykM0NNLwC5o','users','http://localhost',0,1,0,'2025-09-01 09:12:30','2025-09-01 09:12:30'),(54,NULL,'Personal Access Client','NiovrkNUkhNF9x3L3bcZgCZRaBnsQ5DNyS7ZHtSa',NULL,'http://localhost',1,0,0,'2025-09-01 09:18:45','2025-09-01 09:18:45'),(55,NULL,'Password Grant Client','YbkIGf1QsMudl0hb4K8yWqXv42ipf7FS91CeGa8d','users','http://localhost',0,1,0,'2025-09-01 09:18:45','2025-09-01 09:18:45'),(56,NULL,'Personal Access Client','dFS6rOfReHRE8Cv0TxIBqJaedp00XUYDowlxJBVk',NULL,'http://localhost',1,0,0,'2025-09-01 09:25:43','2025-09-01 09:25:43'),(57,NULL,'Password Grant Client','rHHW8rBm9Z9jq9MBneXMCqP6JcHwSH5j2zmuZ9kI','users','http://localhost',0,1,0,'2025-09-01 09:25:43','2025-09-01 09:25:43'),(58,NULL,'Personal Access Client','gSq2AAMnzSs5vKTBKGAUl3aSJFzdWP79qQiXwY5V',NULL,'http://localhost',1,0,0,'2025-09-08 08:21:02','2025-09-08 08:21:02'),(59,NULL,'Password Grant Client','mYj2erpVFINQxpYLaX90CWnHThpmjoj9PrNgbCBT','users','http://localhost',0,1,0,'2025-09-08 08:21:02','2025-09-08 08:21:02'),(60,NULL,'Personal Access Client','0iOIrMhWGTEIEhk3VCXeOjgg0tL2IdvBfPqMJpA8',NULL,'http://localhost',1,0,0,'2025-09-08 12:40:15','2025-09-08 12:40:15'),(61,NULL,'Password Grant Client','0QdJpoMzFYGZljF6HUoz84nvlBcYbsA9JAb4spvU','users','http://localhost',0,1,0,'2025-09-08 12:40:15','2025-09-08 12:40:15'),(62,NULL,'Personal Access Client','7BYeMQmGl8f1DXt9vXXXnrc3I12SFhwkffKxaIdt',NULL,'http://localhost',1,0,0,'2025-09-10 07:07:17','2025-09-10 07:07:17'),(63,NULL,'Password Grant Client','BvtpQ23ZKcCElWhj6YJKI1ydlpt41fzAYgJOYpkl','users','http://localhost',0,1,0,'2025-09-10 07:07:17','2025-09-10 07:07:17'),(64,NULL,'Personal Access Client','Nzg2RJglYbWJ53aWiKUm8cSoQIGqL3TBH7SQIVkW',NULL,'http://localhost',1,0,0,'2025-09-11 12:12:16','2025-09-11 12:12:16'),(65,NULL,'Password Grant Client','UdkWlFZzYpUZwHbEMuZgsrmrdd3sLj4phLZmJzXe','users','http://localhost',0,1,0,'2025-09-11 12:12:16','2025-09-11 12:12:16'),(66,NULL,'Personal Access Client','iN28ZMqaaGtYrr9tGQOS2G13ATz2GrQeW1mDTGdu',NULL,'http://localhost',1,0,0,'2025-09-12 07:20:34','2025-09-12 07:20:34'),(67,NULL,'Password Grant Client','1NToLJL9lNwjU0z2IS2ZKOwJSkE1TBtxrYpuMSIA','users','http://localhost',0,1,0,'2025-09-12 07:20:34','2025-09-12 07:20:34'),(68,NULL,'Personal Access Client','sUiKoMUp8aRZthTrN37jaeJIzVG8eNnzLXcTcOG9',NULL,'http://localhost',1,0,0,'2025-09-13 12:20:20','2025-09-13 12:20:20'),(69,NULL,'Password Grant Client','BOPJRrvzWrsZVLaXCGdXLi1fouQZLEqP3VOELGbA','users','http://localhost',0,1,0,'2025-09-13 12:20:20','2025-09-13 12:20:20'),(70,NULL,'Personal Access Client','GKnvpkVZ5dL7CB3p3VYp4K6FLcxfo1WmbfOPh9mc',NULL,'http://localhost',1,0,0,'2025-09-17 17:07:58','2025-09-17 17:07:58'),(71,NULL,'Password Grant Client','0cGqG0wOOybVk4Aqq08JWBs23Nv2rQEdTZXbpz2Z','users','http://localhost',0,1,0,'2025-09-17 17:07:58','2025-09-17 17:07:58'),(72,NULL,'Personal Access Client','FXfuCNUcfolOLtjOHiyllERv1l9w8eFedEkJZNT3',NULL,'http://localhost',1,0,0,'2025-09-18 07:50:28','2025-09-18 07:50:28'),(73,NULL,'Password Grant Client','wgSbscRpvEnnDrBr9AGrsVwnmB2o7tptOk2LNZee','users','http://localhost',0,1,0,'2025-09-18 07:50:28','2025-09-18 07:50:28'),(74,NULL,'Personal Access Client','wTvY1zcKy6U2ZBl8tQFEvdVdzY4XPPNG5aPPi1o1',NULL,'http://localhost',1,0,0,'2025-09-21 10:25:19','2025-09-21 10:25:19'),(75,NULL,'Password Grant Client','JMu3aEG2HS7SAABqK82iCeCzHZouLN698QGZl2NY','users','http://localhost',0,1,0,'2025-09-21 10:25:19','2025-09-21 10:25:19'),(76,NULL,'Personal Access Client','PxvjPW7Xy8hUSDvvIeeS65Kw49U5u0GG1u1iv9pD',NULL,'http://localhost',1,0,0,'2025-09-21 10:39:22','2025-09-21 10:39:22'),(77,NULL,'Password Grant Client','1OstXFUGX39axbclQ28Go3KEN7cEuAQQRzl9e1hy','users','http://localhost',0,1,0,'2025-09-21 10:39:22','2025-09-21 10:39:22'),(78,NULL,'Personal Access Client','g8s23vSsQLmprDpbUsN7SHQXthQ5AvGumSMb43y5',NULL,'http://localhost',1,0,0,'2025-09-21 10:44:41','2025-09-21 10:44:41'),(79,NULL,'Password Grant Client','evw3eoU6cywG2EvbVBHVy56A97FZR9qcGfFaHgLL','users','http://localhost',0,1,0,'2025-09-21 10:44:41','2025-09-21 10:44:41'),(80,NULL,'Personal Access Client','hZei6SsgxJdyi8WSRkDKLYJHWfg2cpZHfhOoexay',NULL,'http://localhost',1,0,0,'2025-09-21 10:50:15','2025-09-21 10:50:15'),(81,NULL,'Password Grant Client','k0v0Ewj8gxfYYXTpoSSVu6iGprPuoTXuByDpKolx','users','http://localhost',0,1,0,'2025-09-21 10:50:15','2025-09-21 10:50:15'),(82,NULL,'Personal Access Client','oeM8b9e78N2xyLH4RX0LoIOh3bX5ynk7e4pzT3bU',NULL,'http://localhost',1,0,0,'2025-09-22 06:02:53','2025-09-22 06:02:53'),(83,NULL,'Password Grant Client','mfI3hiuCUsQOFhP9ahSXqk8HIN4gjFvzSPC0AodH','users','http://localhost',0,1,0,'2025-09-22 06:02:53','2025-09-22 06:02:53'),(84,NULL,'Personal Access Client','2am8B8v0cttZjtCzm6ZooP5btNPFcGSwDJ8MmlQi',NULL,'http://localhost',1,0,0,'2025-10-10 06:39:02','2025-10-10 06:39:02'),(85,NULL,'Password Grant Client','hVqOfXCMbptMTeBq7z8nbvAZAXiZ2Qtq50W6PDWu','users','http://localhost',0,1,0,'2025-10-10 06:39:02','2025-10-10 06:39:02'),(86,NULL,'Personal Access Client','zkseBiQj1gYTAakTcCgYx3us2swbwKWjFdQ1VbNq',NULL,'http://localhost',1,0,0,'2025-10-11 11:40:23','2025-10-11 11:40:23'),(87,NULL,'Password Grant Client','DmskH061kuNkOac08PFotilNbdg7gqAqXee3uw1T','users','http://localhost',0,1,0,'2025-10-11 11:40:23','2025-10-11 11:40:23'),(88,NULL,'Personal Access Client','OgMNdf7asGk8agKWYV085Fw7peudoZeaOdRkNOGa',NULL,'http://localhost',1,0,0,'2025-10-12 14:58:53','2025-10-12 14:58:53'),(89,NULL,'Password Grant Client','O6FXVWhmSXKnZX3pJSy74wTlXVfQH6zUp4IQYs9v','users','http://localhost',0,1,0,'2025-10-12 14:58:53','2025-10-12 14:58:53'),(90,NULL,'Personal Access Client','I86oZTgLvwc4Ia5lk1FbNiRRIUm7QK1RT7yUTojF',NULL,'http://localhost',1,0,0,'2025-10-13 08:21:13','2025-10-13 08:21:13'),(91,NULL,'Password Grant Client','aQwhmIjzUbvb1sjRJnOvd7NoY2taLRoEKNtnB79E','users','http://localhost',0,1,0,'2025-10-13 08:21:13','2025-10-13 08:21:13'),(92,NULL,'Personal Access Client','8akMk4x5QsSz9Bn0FINyoGWYuaaOiBSPv2ejHyjh',NULL,'http://localhost',1,0,0,'2025-10-13 08:26:38','2025-10-13 08:26:38'),(93,NULL,'Password Grant Client','rZYr5GjI8owdcFAdg5dn23WY1uEj1AJ2fdRdFOcp','users','http://localhost',0,1,0,'2025-10-13 08:26:38','2025-10-13 08:26:38'),(94,NULL,'Personal Access Client','XjgkV79nEtzEH30XQ8o7AD5h57dJgs4X7oH5K1C1',NULL,'http://localhost',1,0,0,'2025-10-13 11:40:38','2025-10-13 11:40:38'),(95,NULL,'Password Grant Client','VZis6tBFayp2qI8X9aVS1IYe3z67C2IllteEmPAR','users','http://localhost',0,1,0,'2025-10-13 11:40:38','2025-10-13 11:40:38'),(96,NULL,'Personal Access Client','AORxvmX2E8Nm97kjCYmrIIMxeJBEixv0YFaTuOR3',NULL,'http://localhost',1,0,0,'2025-10-13 18:09:43','2025-10-13 18:09:43'),(97,NULL,'Password Grant Client','UezEC9Hmzn0ivDUNahdw4EHjgFOm5lKvGiDnR0Xy','users','http://localhost',0,1,0,'2025-10-13 18:09:43','2025-10-13 18:09:43'),(98,NULL,'Personal Access Client','VVvfsbSVKJlTPsCxf63ugsyKfAu4fTdEwGEIjgAQ',NULL,'http://localhost',1,0,0,'2025-10-15 09:25:37','2025-10-15 09:25:37'),(99,NULL,'Password Grant Client','loDFTdnUaNPjzlE0pC2ELBsejpEkE9AaFao9RCME','users','http://localhost',0,1,0,'2025-10-15 09:25:37','2025-10-15 09:25:37'),(100,NULL,'Personal Access Client','BB8vGJRAPIioiZGlXcJsuq9NAnRRhRaxcuL06bLL',NULL,'http://localhost',1,0,0,'2025-10-16 06:38:34','2025-10-16 06:38:34'),(101,NULL,'Password Grant Client','2rpuajgf4GcpdZZSPvHxA2PmIz1Ua2u8p2BkhN1G','users','http://localhost',0,1,0,'2025-10-16 06:38:34','2025-10-16 06:38:34'),(102,NULL,'Personal Access Client','kZSJ4igWWzUiZTHOgMY2a5o4SyE7E5h0KoCGppn3',NULL,'http://localhost',1,0,0,'2025-10-24 07:08:19','2025-10-24 07:08:19'),(103,NULL,'Password Grant Client','j1IQ9Y6SjghioIWNrq3LTzMzbVdFT2F8gNYuxUKg','users','http://localhost',0,1,0,'2025-10-24 07:08:19','2025-10-24 07:08:19'),(104,NULL,'Personal Access Client','vO572EMTPW9UqWxjCemhEtg3pSJxHBXOM2kyIetH',NULL,'http://localhost',1,0,0,'2025-10-25 07:15:13','2025-10-25 07:15:13'),(105,NULL,'Password Grant Client','55aOq99P2neofhYU8S0FKcuFL3UYkI2DANarVdlv','users','http://localhost',0,1,0,'2025-10-25 07:15:13','2025-10-25 07:15:13'),(106,NULL,'Personal Access Client','8sl8VibwoTh8HXnGpDAXnBdivzF7SVdb0YA2GQI0',NULL,'http://localhost',1,0,0,'2025-10-25 20:34:21','2025-10-25 20:34:21'),(107,NULL,'Password Grant Client','vAGKSyVkxCaJ4j1tffZi19vh8ZRM6nvSiUlgkjNc','users','http://localhost',0,1,0,'2025-10-25 20:34:21','2025-10-25 20:34:21'),(108,NULL,'Personal Access Client','vhlxqP2ZIPVLgRcEs0fGphugIsJCr06egZQyFZCH',NULL,'http://localhost',1,0,0,'2025-10-25 20:42:40','2025-10-25 20:42:40'),(109,NULL,'Password Grant Client','FVOkDt8ElSM3FKxPaKEINNJJz2Y9BhxDWM58NG1e','users','http://localhost',0,1,0,'2025-10-25 20:42:40','2025-10-25 20:42:40'),(110,NULL,'Personal Access Client','edff5kKcytFgaG68LfQOCgaR0C3cPvFczNAHhxL3',NULL,'http://localhost',1,0,0,'2025-10-31 06:29:35','2025-10-31 06:29:35'),(111,NULL,'Password Grant Client','PB3YsuRE5AUT3V40SRRCNw3pyPIUAcWamwBguoV0','users','http://localhost',0,1,0,'2025-10-31 06:29:35','2025-10-31 06:29:35'),(112,NULL,'Personal Access Client','a2AgKnBffzlyOj0FOXrYcujv9xWIA7ryLhdoZxBr',NULL,'http://localhost',1,0,0,'2025-11-03 07:01:44','2025-11-03 07:01:44'),(113,NULL,'Password Grant Client','3k8uKjOAMAv3bMEDRpY4Agk2hjnDyEfKB3eFC5Tj','users','http://localhost',0,1,0,'2025-11-03 07:01:44','2025-11-03 07:01:44'),(114,NULL,'Personal Access Client','XWrQgMqbLkR3BPTZbOrDfR2ZuhhgARuUFRBwoSNC',NULL,'http://localhost',1,0,0,'2025-11-03 07:22:52','2025-11-03 07:22:52'),(115,NULL,'Password Grant Client','f0id22QlVDfYaSNqdkIS7uT4WzPXpWWX4sHggAKT','users','http://localhost',0,1,0,'2025-11-03 07:22:52','2025-11-03 07:22:52'),(116,NULL,'Personal Access Client','1bdUbRpgGWIdzkgiR2jbRXKXGMUWS0N0jkJQa0g7',NULL,'http://localhost',1,0,0,'2025-11-04 07:21:32','2025-11-04 07:21:32'),(117,NULL,'Password Grant Client','WzETsdTr21WFV7TmF9cRiwW5af3YnwYHFBQZu0wp','users','http://localhost',0,1,0,'2025-11-04 07:21:32','2025-11-04 07:21:32'),(118,NULL,'Personal Access Client','FlpLS3a3F2527zsXvrwPb3dKFKeDnh2M6N0tpgMO',NULL,'http://localhost',1,0,0,'2025-11-05 11:26:16','2025-11-05 11:26:16'),(119,NULL,'Password Grant Client','yv8QFg2AoySn4dIsAi4FBWKfY9eUnqhbS2XR7mij','users','http://localhost',0,1,0,'2025-11-05 11:26:16','2025-11-05 11:26:16'),(120,NULL,'Personal Access Client','YjrBegwhPGlDg90VeL5vbvccnvVkklp1eykDobiY',NULL,'http://localhost',1,0,0,'2025-11-06 07:45:03','2025-11-06 07:45:03'),(121,NULL,'Password Grant Client','Ta85U0vqznNzEJ4JAdHTUXJadoH3B68OHwot2ro0','users','http://localhost',0,1,0,'2025-11-06 07:45:03','2025-11-06 07:45:03'),(122,NULL,'Personal Access Client','umUKawHIaHqSItq9oPkJY3EASy7Hpxsm2EhImpJW',NULL,'http://localhost',1,0,0,'2025-11-06 07:47:27','2025-11-06 07:47:27'),(123,NULL,'Password Grant Client','gWI4yLIdVLikp3c1X8sQjQ7atWBCQsRnZUADzZZo','users','http://localhost',0,1,0,'2025-11-06 07:47:27','2025-11-06 07:47:27'),(124,NULL,'Personal Access Client','OvPAxOq3Rlpy6ckJCsMUDgqwmJErJxpQ3yKDPSLh',NULL,'http://localhost',1,0,0,'2025-11-18 10:08:50','2025-11-18 10:08:50'),(125,NULL,'Password Grant Client','FZQM7zPGq8XHpXa1NCqmXGZmUQsW7oBFMsXaBXfM','users','http://localhost',0,1,0,'2025-11-18 10:08:50','2025-11-18 10:08:50'),(126,NULL,'Personal Access Client','5VpKP5ouwnBAT3yqAu2Q3B0amVKcikhdUtzbfubr',NULL,'http://localhost',1,0,0,'2025-11-20 07:39:32','2025-11-20 07:39:32'),(127,NULL,'Password Grant Client','q55gKgdZJyqM3ykNDViXd3SkNN1sSTouLZOUTvzl','users','http://localhost',0,1,0,'2025-11-20 07:39:32','2025-11-20 07:39:32'),(128,NULL,'Personal Access Client','cwwXzcD1w2pkwEz94HkZfGDQzzP3wDNVXggsQ9D1',NULL,'http://localhost',1,0,0,'2025-11-21 16:45:56','2025-11-21 16:45:56'),(129,NULL,'Password Grant Client','6IMNYHpFoaZchebn85L3LBorbDqTtjpj4PmVtMzf','users','http://localhost',0,1,0,'2025-11-21 16:45:56','2025-11-21 16:45:56'),(130,NULL,'Personal Access Client','kQOnVl88yxSqmAvUNgFWvRtEWEvI6E0mqPN9Xo8H',NULL,'http://localhost',1,0,0,'2025-11-23 09:44:23','2025-11-23 09:44:23'),(131,NULL,'Password Grant Client','do2F8gdGNDoLf7jaDcBchOBiFOO4apZTRmXcwqeb','users','http://localhost',0,1,0,'2025-11-23 09:44:23','2025-11-23 09:44:23'),(132,NULL,'Personal Access Client','67el5R8r7Tf3HqUOatcFUBO4NqQQqU2446L4wULs',NULL,'http://localhost',1,0,0,'2025-11-25 07:27:51','2025-11-25 07:27:51'),(133,NULL,'Password Grant Client','mFKGJVf3uphPVzJjTM8Zc9Sb3t1QrM2p2sWZqQCm','users','http://localhost',0,1,0,'2025-11-25 07:27:51','2025-11-25 07:27:51'),(134,NULL,'Personal Access Client','SIqOIWQBeriQFxPvoS8rsq4ydMUiJJxwpXU4ZThZ',NULL,'http://localhost',1,0,0,'2025-11-28 07:36:23','2025-11-28 07:36:23'),(135,NULL,'Password Grant Client','h01p04sruYoVCRaEgsbSbVZboY995EVdkToRHkQ7','users','http://localhost',0,1,0,'2025-11-28 07:36:23','2025-11-28 07:36:23'),(136,NULL,'Personal Access Client','TO8bz1xGKqkc5BVRyzDjSoGj72bIcAsp6COFJwsz',NULL,'http://localhost',1,0,0,'2025-12-09 10:20:15','2025-12-09 10:20:15'),(137,NULL,'Password Grant Client','9xntxKH67gLqjSDr7McCU9U1jMMng8lzuJP6ZWDd','users','http://localhost',0,1,0,'2025-12-09 10:20:15','2025-12-09 10:20:15'),(138,NULL,'Personal Access Client','8MLeoTfN6iDaRbdzHG6ozf5hMndhQCeJNRUT8t8c',NULL,'http://localhost',1,0,0,'2026-02-25 07:05:03','2026-02-25 07:05:03'),(139,NULL,'Personal Access Client','oKwfDuI7elOa3m1HmD8jhOEDZf834mlQxa7epHhc',NULL,'http://localhost',1,0,0,'2026-02-25 07:07:47','2026-02-25 07:07:47'),(140,NULL,'Personal Access Client','1pqSfE5xyYzNURCNsQAA1bOtwFudgcy7Hg5KTi28',NULL,'http://localhost',1,0,0,'2026-02-25 07:08:24','2026-02-25 07:08:24'),(141,NULL,'Password Grant Client','vcnx2YiuT84KhTPpeUAENBtcroRm88T1Vlfmpo4E','users','http://localhost',0,1,0,'2026-02-25 07:08:24','2026-02-25 07:08:24');
/*!40000 ALTER TABLE `oauth_clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_personal_access_clients`
--

DROP TABLE IF EXISTS `oauth_personal_access_clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oauth_personal_access_clients` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `client_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_personal_access_clients`
--

LOCK TABLES `oauth_personal_access_clients` WRITE;
/*!40000 ALTER TABLE `oauth_personal_access_clients` DISABLE KEYS */;
INSERT INTO `oauth_personal_access_clients` VALUES (1,1,'2025-08-08 11:24:20','2025-08-08 11:24:20'),(2,2,'2025-08-08 11:24:33','2025-08-08 11:24:33'),(3,4,'2025-08-10 10:04:44','2025-08-10 10:04:44'),(4,6,'2025-08-11 08:56:16','2025-08-11 08:56:16'),(5,8,'2025-08-12 07:27:42','2025-08-12 07:27:42'),(6,10,'2025-08-12 10:27:29','2025-08-12 10:27:29'),(7,12,'2025-08-13 10:49:13','2025-08-13 10:49:13'),(8,14,'2025-08-13 10:52:32','2025-08-13 10:52:32'),(9,16,'2025-08-15 19:55:38','2025-08-15 19:55:38'),(10,18,'2025-08-16 17:23:51','2025-08-16 17:23:51'),(11,20,'2025-08-17 12:39:19','2025-08-17 12:39:19'),(12,22,'2025-08-18 19:16:53','2025-08-18 19:16:53'),(13,24,'2025-08-19 19:22:15','2025-08-19 19:22:15'),(14,26,'2025-08-19 19:23:34','2025-08-19 19:23:34'),(15,28,'2025-08-19 20:13:44','2025-08-19 20:13:44'),(16,30,'2025-08-19 21:10:45','2025-08-19 21:10:45'),(17,32,'2025-08-20 12:48:35','2025-08-20 12:48:35'),(18,34,'2025-08-28 05:29:21','2025-08-28 05:29:21'),(19,36,'2025-08-28 05:42:16','2025-08-28 05:42:16'),(20,38,'2025-08-28 06:05:45','2025-08-28 06:05:45'),(21,40,'2025-08-28 11:33:53','2025-08-28 11:33:53'),(22,42,'2025-08-28 11:40:15','2025-08-28 11:40:15'),(23,44,'2025-08-28 11:42:13','2025-08-28 11:42:13'),(24,46,'2025-08-28 11:50:03','2025-08-28 11:50:03'),(25,48,'2025-08-28 12:23:54','2025-08-28 12:23:54'),(26,50,'2025-08-28 19:56:31','2025-08-28 19:56:31'),(27,52,'2025-09-01 09:12:30','2025-09-01 09:12:30'),(28,54,'2025-09-01 09:18:45','2025-09-01 09:18:45'),(29,56,'2025-09-01 09:25:43','2025-09-01 09:25:43'),(30,58,'2025-09-08 08:21:02','2025-09-08 08:21:02'),(31,60,'2025-09-08 12:40:15','2025-09-08 12:40:15'),(32,62,'2025-09-10 07:07:17','2025-09-10 07:07:17'),(33,64,'2025-09-11 12:12:16','2025-09-11 12:12:16'),(34,66,'2025-09-12 07:20:34','2025-09-12 07:20:34'),(35,68,'2025-09-13 12:20:20','2025-09-13 12:20:20'),(36,70,'2025-09-17 17:07:58','2025-09-17 17:07:58'),(37,72,'2025-09-18 07:50:28','2025-09-18 07:50:28'),(38,74,'2025-09-21 10:25:19','2025-09-21 10:25:19'),(39,76,'2025-09-21 10:39:22','2025-09-21 10:39:22'),(40,78,'2025-09-21 10:44:41','2025-09-21 10:44:41'),(41,80,'2025-09-21 10:50:15','2025-09-21 10:50:15'),(42,82,'2025-09-22 06:02:53','2025-09-22 06:02:53'),(43,84,'2025-10-10 06:39:02','2025-10-10 06:39:02'),(44,86,'2025-10-11 11:40:23','2025-10-11 11:40:23'),(45,88,'2025-10-12 14:58:53','2025-10-12 14:58:53'),(46,90,'2025-10-13 08:21:13','2025-10-13 08:21:13'),(47,92,'2025-10-13 08:26:38','2025-10-13 08:26:38'),(48,94,'2025-10-13 11:40:38','2025-10-13 11:40:38'),(49,96,'2025-10-13 18:09:43','2025-10-13 18:09:43'),(50,98,'2025-10-15 09:25:37','2025-10-15 09:25:37'),(51,100,'2025-10-16 06:38:34','2025-10-16 06:38:34'),(52,102,'2025-10-24 07:08:19','2025-10-24 07:08:19'),(53,104,'2025-10-25 07:15:13','2025-10-25 07:15:13'),(54,106,'2025-10-25 20:34:21','2025-10-25 20:34:21'),(55,108,'2025-10-25 20:42:40','2025-10-25 20:42:40'),(56,110,'2025-10-31 06:29:35','2025-10-31 06:29:35'),(57,112,'2025-11-03 07:01:44','2025-11-03 07:01:44'),(58,114,'2025-11-03 07:22:52','2025-11-03 07:22:52'),(59,116,'2025-11-04 07:21:32','2025-11-04 07:21:32'),(60,118,'2025-11-05 11:26:16','2025-11-05 11:26:16'),(61,120,'2025-11-06 07:45:03','2025-11-06 07:45:03'),(62,122,'2025-11-06 07:47:27','2025-11-06 07:47:27'),(63,124,'2025-11-18 10:08:50','2025-11-18 10:08:50'),(64,126,'2025-11-20 07:39:32','2025-11-20 07:39:32'),(65,128,'2025-11-21 16:45:56','2025-11-21 16:45:56'),(66,130,'2025-11-23 09:44:23','2025-11-23 09:44:23'),(67,132,'2025-11-25 07:27:51','2025-11-25 07:27:51'),(68,134,'2025-11-28 07:36:23','2025-11-28 07:36:23'),(69,136,'2025-12-09 10:20:15','2025-12-09 10:20:15'),(70,140,'2026-02-25 07:08:24','2026-02-25 07:08:24');
/*!40000 ALTER TABLE `oauth_personal_access_clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_refresh_tokens`
--

DROP TABLE IF EXISTS `oauth_refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oauth_refresh_tokens` (
  `id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `access_token_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `revoked` tinyint(1) NOT NULL,
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_refresh_tokens`
--

LOCK TABLES `oauth_refresh_tokens` WRITE;
/*!40000 ALTER TABLE `oauth_refresh_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `oauth_refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `private_scene_configs`
--

DROP TABLE IF EXISTS `private_scene_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `private_scene_configs` (
  `id` bigint unsigned NOT NULL,
  `island_type` int NOT NULL,
  `big_scene` tinyint(1) NOT NULL DEFAULT '0',
  `max_users` int NOT NULL DEFAULT '10',
  `map_width` int NOT NULL DEFAULT '30',
  `map_height` int NOT NULL DEFAULT '30',
  `map` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_x` int NOT NULL DEFAULT '11',
  `start_y` int NOT NULL DEFAULT '11',
  `start_z` int NOT NULL DEFAULT '2',
  `default_colors` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `assets_data` text COLLATE utf8mb4_unicode_ci,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `private_scene_configs`
--

LOCK TABLES `private_scene_configs` WRITE;
/*!40000 ALTER TABLE `private_scene_configs` DISABLE KEYS */;
INSERT INTO `private_scene_configs` VALUES (1,1,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n[1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\r\n[1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]',7,19,2,'{\"item_1\":\"00b3fb\",\"item_2\":\"0ba4e3\",\"item_3\":\"d8cfb3\",\"item_4\":\"3d240c\",\"item_5\":\"002700\",\"item_6\":\"002700\"}','2025-08-08 11:24:20','2025-10-31 06:40:29','Scene 1','uploads/island-scene/scene-1/CaiUq16Fa5eiptM1gLIATF8yo6HUogohRkNS6sqh.webp','{\"assets_data_repeatable\":[{\"position_x\":\"506\",\"position_y\":\"161\",\"depth\":\"81\",\"color_item_key\":\"item_1\",\"image\":\"uploads\\/island-scene\\/scene-1\\/assets\\/82Ab6Z94P3dJBKhCYrCnhtWCOCSCmmnkp6vVkPdL.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"506\",\"position_y\":\"657\",\"depth\":\"97\",\"color_item_key\":\"item_2\",\"image\":\"uploads\\/island-scene\\/scene-1\\/assets\\/aIGXPKsnjCW134ZosGaGsdeET3nxK2kLWQXPO3WM.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"547\",\"position_y\":\"657\",\"depth\":\"98\",\"color_item_key\":\"item_3\",\"image\":\"uploads\\/island-scene\\/scene-1\\/assets\\/BlPnIXfwyz8vQ5nFwj6BPgS5Z48WLsvl5CBwOjnk.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"129\",\"position_y\":\"517\",\"depth\":\"99\",\"color_item_key\":\"item_4\",\"image\":\"uploads\\/island-scene\\/scene-1\\/assets\\/VLrTW3ZG8xcy4pw9schLZrPbt1LAk6ueXVPbeQuG.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"859\",\"position_y\":\"476\",\"depth\":\"476\",\"color_item_key\":\"item_5\",\"image\":\"uploads\\/island-scene\\/scene-1\\/assets\\/KZ3GuX3WDq70ZwIpqvKWM2FBk8amALIZlGc37OzU.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"81\",\"position_y\":\"125\",\"depth\":\"165\",\"color_item_key\":\"item_6\",\"image\":\"uploads\\/island-scene\\/scene-1\\/assets\\/DkgM9GEP8MtNfwTDxRJxl90QOECDQ7s9QKvPzdU2.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"506\",\"position_y\":\"657\",\"depth\":\"150\",\"color_item_key\":\"item_7\",\"image\":\"uploads\\/island-scene\\/scene-1\\/assets\\/yxmHBWBLGh2LWq6tXqbg5KzPmJP7UM1Mpc8NxvRx.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"105\",\"position_y\":\"251\",\"depth\":\"151\",\"color_item_key\":\"item_8\",\"image\":\"uploads\\/island-scene\\/scene-1\\/assets\\/WvwQGdUTmM6jdsPYEZoxpekeMQCYCFGFfQYOsJMl.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"}]}',1),(2,1,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]',11,11,2,'{\"item_1\":\"2090ED\",\"item_2\":\"265416\",\"item_3\":\"A28B5A\",\"item_4\":\"369FE2\",\"item_6\":\"A28B5A\",\"item_7\":\"265416\",\"item_8\":\"016000\",\"item_9\":\"016000\"}','2025-08-08 11:24:20','2025-10-31 06:47:00','Scene 2','uploads/island-scene/scene-2/r6BmZAzIhTd7NSSKYhKl5tdcn8Y9C5M3EAtaR6A5.webp','{\"assets_data_repeatable\":[{\"position_x\":\"506\",\"position_y\":\"92\",\"depth\":\"97\",\"color_item_key\":\"item_1\",\"image\":\"uploads\\/island-scene\\/scene-2\\/assets\\/YLd8W8JP8xn8jloYMCkQdHQ2cIqv6gntw8rP2qZ1.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"506\",\"position_y\":\"516\",\"depth\":\"97\",\"color_item_key\":\"item_2\",\"image\":\"uploads\\/island-scene\\/scene-2\\/assets\\/aqRYVqpaMW9YVGebdBnA8JG6LAL4yqO3kU1PqLV0.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"347\",\"position_y\":\"398\",\"depth\":\"97\",\"color_item_key\":\"item_3\",\"image\":\"uploads\\/island-scene\\/scene-2\\/assets\\/J0lKzlmXnYKbs0QR6m1kI7IHMTe61QqRUof2aUTW.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"180\",\"position_y\":\"657\",\"depth\":\"98\",\"color_item_key\":\"item_4\",\"image\":\"uploads\\/island-scene\\/scene-2\\/assets\\/vJA4wWdO0oD5lmadZK8GY8FqpRadtqK2Sx0atY9D.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"506\",\"position_y\":\"658\",\"depth\":\"99\",\"color_item_key\":\"item_5\",\"image\":\"uploads\\/island-scene\\/scene-2\\/assets\\/0m2LP2WswuDtCxtfAQZz2ssDuUXIyreVXATnsZxj.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"128\",\"position_y\":\"548\",\"depth\":\"101\",\"color_item_key\":\"item_6\",\"image\":\"uploads\\/island-scene\\/scene-2\\/assets\\/dF7hhnuFHRbwNPsEWaFOBGrEv7CaaRmjtGhUdB4b.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"622\",\"position_y\":\"657\",\"depth\":\"99\",\"color_item_key\":\"item_7\",\"image\":\"uploads\\/island-scene\\/scene-2\\/assets\\/f4EJS8PrUgp90szP6DwbY2MfPCvawaRVgQd9GfFc.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"324\",\"position_y\":\"444\",\"depth\":\"103\",\"color_item_key\":\"item_8\",\"image\":\"uploads\\/island-scene\\/scene-2\\/assets\\/dI1vbPdzom1At9ZYFEgMF8iHz5t9LBABZC2jMvUz.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"425\",\"position_y\":\"381\",\"depth\":\"365\",\"color_item_key\":\"item_9\",\"image\":\"uploads\\/island-scene\\/scene-2\\/assets\\/cS0oebi3MoT2xLJCpe0V0iEwW5RXePUd9zFZQokZ.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"}]}',1),(3,1,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\r\n [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],\r\n [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],\r\n [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],\r\n [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\r\n [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]',11,11,2,'{\"item_1\":\"04ABCE\",\"item_2\":\"49D4D2\",\"item_3\":\"825D36\",\"item_4\":\"4E9185\",\"item_5\":\"004100\",\"item_6\":\"084C07\"}','2025-08-08 11:24:20','2025-10-31 06:50:50','Scene 3','uploads/island-scene/scene-3/wHwqjJSOGJQtnd5SjYAzmmCY4RQFKDtPsY8H8IxU.webp','{\"assets_data_repeatable\":[{\"position_x\":\"506\",\"position_y\":\"226\",\"depth\":\"63\",\"color_item_key\":\"item_1\",\"image\":\"uploads\\/island-scene\\/scene-3\\/assets\\/bR7DWbJ1lomc9HsKohKC7xk9PrlswTYxNCj5q7e0.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"506\",\"position_y\":\"374\",\"depth\":\"76\",\"color_item_key\":\"item_2\",\"image\":\"uploads\\/island-scene\\/scene-3\\/assets\\/nrv5Q3soq5lIHdBVFi4du6yDibC9o1efebRFIRkG.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"542\",\"position_y\":\"247\",\"depth\":\"92\",\"color_item_key\":\"item_3\",\"image\":\"uploads\\/island-scene\\/scene-3\\/assets\\/2IpuilwqBV0JdCADkZI90oXax4g3dZ5LS5wgssRZ.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"490\",\"position_y\":\"399\",\"depth\":\"93\",\"color_item_key\":\"item_4\",\"image\":\"uploads\\/island-scene\\/scene-3\\/assets\\/OQhJ8B9U1ym4QWBjPaiy41RvudysSHx1FEXLxYF7.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"506\",\"position_y\":\"657\",\"depth\":\"99\",\"color_item_key\":\"item_5\",\"image\":\"uploads\\/island-scene\\/scene-3\\/assets\\/58V9SYlAwj8QfMejGtUPkKKfM7AEYtE2rgXnCJL3.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"891\",\"position_y\":\"201\",\"depth\":\"165\",\"color_item_key\":\"item_6\",\"image\":\"uploads\\/island-scene\\/scene-3\\/assets\\/tf7FziHWOmd9Ari6wrgs3cD6cCWzuG3js8ZIauiZ.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"506\",\"position_y\":\"402\",\"depth\":\"150\",\"color_item_key\":\"item_7\",\"image\":\"uploads\\/island-scene\\/scene-3\\/assets\\/h8JgPImjdgTgwq2h6aeWFNqts63xMzt6RvJldQie.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"504\",\"position_y\":\"157\",\"depth\":\"151\",\"color_item_key\":\"item_8\",\"image\":\"uploads\\/island-scene\\/scene-3\\/assets\\/xy8MgrMrQNAl0IEYSv3POL7ftGJOZ9w5vm8SPh3T.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"}]}',1),(4,2,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\r\n [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\r\n [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],\r\n [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],\r\n [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],\r\n [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\r\n [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]',11,11,2,'{\"item_1\":\"000C1E\",\"item_2\":\"D5FEB1\",\"item_3\":\"2B7D90\",\"item_4\":\"2B7D90\"}','2025-08-08 11:24:20','2025-10-31 06:54:34','Scene 1','uploads/island-scene/scene-1/xIDDlkhwESDpf1XPJoHa3drRHwIHqTX4vKyxXS9o.webp','{\"assets_data_repeatable\":[{\"position_x\":\"506\",\"position_y\":\"166\",\"depth\":\"63\",\"color_item_key\":\"item_1\",\"image\":\"uploads\\/island-scene\\/scene-1\\/assets\\/QjIFqEyyc6rp3WnpAkcEAgipMuqfah646Hxt1Zir.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"688\",\"position_y\":\"137\",\"depth\":\"97\",\"color_item_key\":\"item_2\",\"image\":\"uploads\\/island-scene\\/scene-1\\/assets\\/G0ZKKC7sGsWOqLbgCNXibNpelsealguWHrsKJsMt.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"505\",\"position_y\":\"416\",\"depth\":\"92\",\"color_item_key\":\"item_3\",\"image\":\"uploads\\/island-scene\\/scene-1\\/assets\\/4juQgXjeOx4appT4jfpaWgI6gDJH4jGe2jlD0e70.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"506\",\"position_y\":\"657\",\"depth\":\"93\",\"color_item_key\":\"item_4\",\"image\":\"uploads\\/island-scene\\/scene-1\\/assets\\/ekp9wXrS5X0OCH5dBJrXgwzckCYpPUcikEi0Y1Za.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"506\",\"position_y\":\"657\",\"depth\":\"99\",\"color_item_key\":\"item_5\",\"image\":\"uploads\\/island-scene\\/scene-1\\/assets\\/Akwt85TuAf7OOYCdOa1ZC8IYjYibkjSdSvlMfDhO.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"867\",\"position_y\":\"657\",\"depth\":\"165\",\"color_item_key\":\"item_6\",\"image\":\"uploads\\/island-scene\\/scene-1\\/assets\\/0OujtB3cm25ehM0niIFwEqWhr6C9lLIIlvMwZpSX.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"}]}',1),(5,2,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],\r\n [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],\r\n [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],\r\n [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]',11,11,2,'{\"item_1\":\"377180\",\"item_2\":\"38757C\",\"item_4\":\"0799A9\",\"item_5\":\"33A3A9\"}','2025-08-08 11:24:20','2025-10-31 06:57:18','Scene 2','uploads/island-scene/scene-2/TaytyEvPdNjfo5H6Tk8Lpq01QMrn2pZuGx9jnVUC.webp','{\"assets_data_repeatable\":[{\"position_x\":\"506\",\"position_y\":\"657\",\"depth\":\"63\",\"color_item_key\":\"item_1\",\"image\":\"uploads\\/island-scene\\/scene-2\\/assets\\/48VDbWRsZYsMyXDx9wWfoUkOczBSBorRb1y2JxX8.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"505\",\"position_y\":\"658\",\"depth\":\"97\",\"color_item_key\":\"item_2\",\"image\":\"uploads\\/island-scene\\/scene-2\\/assets\\/s2sAPV6eBb0JPIP9iwimsekAxX7VWxhYp7KyPFEq.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"643\",\"position_y\":\"281\",\"depth\":\"92\",\"color_item_key\":\"item_3\",\"image\":\"uploads\\/island-scene\\/scene-2\\/assets\\/ZYnvLlo5lp4Sy6dUMu6vjf76EutEymfut9ZXYfXs.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"249\",\"position_y\":\"531\",\"depth\":\"108\",\"color_item_key\":\"item_4\",\"image\":\"uploads\\/island-scene\\/scene-2\\/assets\\/L6WEwULvTe36rnExFOB1brdKyITm69FmkDoE1THU.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"522\",\"position_y\":\"656\",\"depth\":\"99\",\"color_item_key\":\"item_5\",\"image\":\"uploads\\/island-scene\\/scene-2\\/assets\\/cQhR4OejCz0UVDT9UrKY0pa8TObkEVsRUlieLvAt.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"506\",\"position_y\":\"657\",\"depth\":\"165\",\"color_item_key\":\"item_6\",\"image\":\"uploads\\/island-scene\\/scene-2\\/assets\\/NNG0I28C5vFnhTG80IcSyVMmHMgSAEXhB0eze7UK.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"}]}',1),(6,2,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,0,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1],\r\n [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1],\r\n [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\r\n [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],\r\n [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],\r\n [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],\r\n [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\r\n [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]',11,11,2,'{\"item_1\":\"E24E04\",\"item_2\":\"920700\",\"item_3\":\"6C0000\",\"item_4\":\"7E0800\",\"item_5\":\"F6C400\",\"item_6\":\"F8C600\",\"item_7\":\"F6C400\",\"item_8\":\"F6C400\",\"item_10\":\"AC2100\"}','2025-08-08 11:24:20','2025-10-31 07:08:47','Scene 3','uploads/island-scene/scene-3/PwO3hMyORgtzIjPllnTj4dwkcVYVWrecXb6bZLTt.webp','{\"assets_data_repeatable\":[{\"position_x\":\"506\",\"position_y\":\"312\",\"depth\":\"63\",\"color_item_key\":\"item_1\",\"image\":\"uploads\\/island-scene\\/scene-3\\/assets\\/5dSbni5M1guptmzH2ctISf8X37EUgo4WizsLPHuQ.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"506\",\"position_y\":\"657\",\"depth\":\"97\",\"color_item_key\":\"item_2\",\"image\":\"uploads\\/island-scene\\/scene-3\\/assets\\/As1mzHraT1A6SpRhiizRMJCR3QVUvFRblDCHsaPI.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"731\",\"position_y\":\"477\",\"depth\":\"447\",\"color_item_key\":\"item_3\",\"image\":\"uploads\\/island-scene\\/scene-3\\/assets\\/UVObpN4kgE645b91GMdIQVSu4nbPtgZDWDLPhaHs.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"517\",\"position_y\":\"467\",\"depth\":\"463\",\"color_item_key\":\"item_4\",\"image\":\"uploads\\/island-scene\\/scene-3\\/assets\\/rV80KHE0hhi1fSfpmsXExm4fXCNUfqXhPHrWDKtM.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"799\",\"position_y\":\"573\",\"depth\":\"456\",\"color_item_key\":\"item_5\",\"image\":\"uploads\\/island-scene\\/scene-3\\/assets\\/NICh1guYvn955gnVXvCwXYr2qKKG0UqOf61wQFY2.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"466\",\"position_y\":\"263\",\"depth\":\"165\",\"color_item_key\":\"item_6\",\"image\":\"uploads\\/island-scene\\/scene-3\\/assets\\/3LouerKl3qQvoLbHD25Ya9yNZ6RHgB0dZwG3BIXR.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"706\",\"position_y\":\"498\",\"depth\":\"448\",\"color_item_key\":\"item_7\",\"image\":\"uploads\\/island-scene\\/scene-3\\/assets\\/z4nYBnu6CxMidOi3YCf7AisrpeBlhcbJe6MSndnQ.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"528\",\"position_y\":\"466\",\"depth\":\"464\",\"color_item_key\":\"item_8\",\"image\":\"uploads\\/island-scene\\/scene-3\\/assets\\/bUnS9mHiXQEgbXWw5MIJ4bVyHo3EEEEveY7ERgdr.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"464\",\"position_y\":\"308\",\"depth\":\"139\",\"color_item_key\":\"item_9\",\"image\":\"uploads\\/island-scene\\/scene-3\\/assets\\/HJLTXJwQTzgEZtBoDeJauNbXQUjURFJ7WReXBFfG.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"65\",\"position_y\":\"657\",\"depth\":\"97\",\"color_item_key\":\"item_10\",\"image\":\"uploads\\/island-scene\\/scene-3\\/assets\\/OArJtXzxAGL5YLCA4C7HHcMVUjqPrb14pcJhfKLp.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"}]}',1),(7,3,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]',11,11,2,NULL,'2025-08-08 11:24:20','2025-10-31 06:41:05','','',NULL,0),(8,3,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]',11,11,2,NULL,'2025-08-08 11:24:20','2025-10-31 06:41:05','','',NULL,0),(9,3,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]',11,11,2,NULL,'2025-08-08 11:24:20','2025-10-31 06:41:04','','',NULL,0),(10,4,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]',11,11,2,NULL,'2025-08-08 11:24:20','2025-10-31 06:41:03','','',NULL,0),(11,4,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]',11,11,2,NULL,'2025-08-08 11:24:20','2025-10-31 06:41:02','','',NULL,0),(12,4,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]',11,11,2,NULL,'2025-08-08 11:24:20','2025-10-31 06:41:02','','',NULL,0),(13,5,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]',11,11,2,NULL,'2025-08-08 11:24:20','2025-10-31 06:41:01','','',NULL,0),(14,5,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]',11,11,2,NULL,'2025-08-08 11:24:20','2025-10-31 06:41:01','','',NULL,0),(15,5,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]',11,11,2,NULL,'2025-08-08 11:24:20','2025-10-31 06:41:00','','',NULL,0),(16,6,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\r\n [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],\r\n [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],\r\n [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],\r\n [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\r\n [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]',6,13,2,'{}','2025-11-02 09:55:02','2025-11-02 10:16:46','Monttawa Beach','uploads/island-scene/monttawa-beach/8V3NtgbLS53mate3ujfIGAJKTsxPKPQXsDk6dUFE.webp','{\"assets_data_repeatable\":[{\"position_x\":\"0\",\"position_y\":\"0\",\"depth\":\"0\",\"color_item_key\":null,\"image\":\"uploads\\/island-scene\\/monttawa-beach\\/assets\\/cNen4PLB3lTCoZQqopENSlq04BHyPLzM2mPoXSPX.webp\",\"scale\":\"1\",\"is_background\":\"1\",\"show_controller\":\"0\",\"active\":\"1\"}]}',1),(17,1,1,10,60,60,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]',18,42,2,'{}','2025-11-25 07:32:13','2025-11-25 07:32:32','Scene 4','uploads/island-scene/scene-4/OROVISM8Ph8n9ZkYOoo25AtnXexiQ7Th6lsjUvNK.png','{\"assets_data_repeatable\":[{\"position_x\":\"0\",\"position_y\":\"0\",\"depth\":\"0\",\"color_item_key\":null,\"image\":\"uploads\\/island-scene\\/scene-4\\/assets\\/7t1o2rIDt7IwtKdmGlghPd4RL351dSlJF1vcNJTS.png\",\"scale\":\"1\",\"is_background\":\"1\",\"show_controller\":\"0\",\"active\":\"1\"}]}',1);
/*!40000 ALTER TABLE `private_scene_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `private_scenes`
--

DROP TABLE IF EXISTS `private_scenes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `private_scenes` (
  `id` bigint unsigned NOT NULL,
  `island_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `type` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `colors` text COLLATE utf8mb4_unicode_ci,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `private_scenes`
--

LOCK TABLES `private_scenes` WRITE;
/*!40000 ALTER TABLE `private_scenes` DISABLE KEYS */;
/*!40000 ALTER TABLE `private_scenes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `public_scene_items`
--

DROP TABLE IF EXISTS `public_scene_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `public_scene_items` (
  `public_scenes_id` bigint unsigned NOT NULL,
  `scene_item_id` bigint unsigned NOT NULL,
  `activate_time` int NOT NULL DEFAULT '60' COMMENT 'Time in seconds for which the item is visible',
  `desactivate_time` int NOT NULL DEFAULT '15' COMMENT 'Time in seconds after which the item is hidden',
  `min_users` int NOT NULL DEFAULT '2' COMMENT 'Minimum number of users required to display the item',
  `sum_points` int NOT NULL DEFAULT '1',
  `sum_points_to_user_attribute` tinyint(1) NOT NULL DEFAULT '0',
  `user_attribute_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_id` bigint unsigned DEFAULT NULL,
  `catalog_item_id` bigint unsigned DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `public_scene_items`
--

LOCK TABLES `public_scene_items` WRITE;
/*!40000 ALTER TABLE `public_scene_items` DISABLE KEYS */;
INSERT INTO `public_scene_items` VALUES (1,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(1,3,600,15,1,50,1,'silver_coins',NULL,NULL),(2,2,180,15,1,1,1,'coconuts_caught',NULL,NULL),(2,3,600,15,1,50,1,'silver_coins',NULL,NULL),(3,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(3,3,600,15,1,50,1,'silver_coins',NULL,NULL),(4,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(4,3,600,15,1,50,1,'silver_coins',NULL,NULL),(5,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(5,3,600,15,1,50,1,'silver_coins',NULL,NULL),(6,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(6,3,600,15,1,50,1,'silver_coins',NULL,NULL),(7,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(7,3,600,15,1,50,1,'silver_coins',NULL,NULL),(8,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(8,3,600,15,1,50,1,'silver_coins',NULL,NULL),(9,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(9,3,600,15,1,50,1,'silver_coins',NULL,NULL),(10,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(10,3,600,15,1,50,1,'silver_coins',NULL,NULL),(11,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(11,3,600,15,1,50,1,'silver_coins',NULL,NULL),(12,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(12,3,600,15,1,50,1,'silver_coins',NULL,NULL),(13,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(13,3,600,15,1,50,1,'silver_coins',NULL,NULL),(14,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(14,3,600,15,1,50,1,'silver_coins',NULL,NULL),(15,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(15,3,600,15,1,50,1,'silver_coins',NULL,NULL),(16,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(16,3,600,15,1,50,1,'silver_coins',NULL,NULL),(17,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(17,3,600,15,1,50,1,'silver_coins',NULL,NULL),(18,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(18,3,600,15,1,50,1,'silver_coins',NULL,NULL),(19,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(19,3,600,15,1,50,1,'silver_coins',NULL,NULL),(20,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(20,3,600,15,1,50,1,'silver_coins',NULL,NULL),(21,2,180,15,1,1,1,'coconuts_caught',NULL,NULL),(21,3,600,15,1,50,1,'silver_coins',NULL,NULL),(22,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(22,3,600,15,1,50,1,'silver_coins',NULL,NULL),(23,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(23,3,600,15,1,50,1,'silver_coins',NULL,NULL),(24,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(24,3,600,15,1,50,1,'silver_coins',NULL,NULL),(25,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(25,3,600,15,1,50,1,'silver_coins',NULL,NULL),(26,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(26,3,600,15,1,50,1,'silver_coins',NULL,NULL),(27,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(27,3,600,15,1,50,1,'silver_coins',NULL,NULL),(28,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(28,3,600,15,1,50,1,'silver_coins',NULL,NULL),(29,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(29,3,600,15,1,50,1,'silver_coins',NULL,NULL),(30,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(30,3,600,15,1,50,1,'silver_coins',NULL,NULL),(31,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(31,3,600,15,1,50,1,'silver_coins',NULL,NULL),(32,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(32,3,600,15,1,50,1,'silver_coins',NULL,NULL),(33,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(33,3,600,15,1,50,1,'silver_coins',NULL,NULL),(34,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(34,3,600,15,1,50,1,'silver_coins',NULL,NULL),(35,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(35,3,600,15,1,50,1,'silver_coins',NULL,NULL),(36,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(36,3,600,15,1,50,1,'silver_coins',NULL,NULL),(37,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(37,3,600,15,1,50,1,'silver_coins',NULL,NULL),(38,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(38,3,600,15,1,50,1,'silver_coins',NULL,NULL),(39,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(39,3,600,15,1,50,1,'silver_coins',NULL,NULL),(40,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(40,3,600,15,1,50,1,'silver_coins',NULL,NULL),(41,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(41,3,600,15,1,50,1,'silver_coins',NULL,NULL),(42,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(42,3,600,15,1,50,1,'silver_coins',NULL,NULL),(43,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(43,3,600,15,1,50,1,'silver_coins',NULL,NULL),(44,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(44,3,600,15,1,50,1,'silver_coins',NULL,NULL),(45,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(45,3,600,15,1,50,1,'silver_coins',NULL,NULL),(46,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(46,3,600,15,1,50,1,'silver_coins',NULL,NULL),(47,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(47,3,600,15,1,50,1,'silver_coins',NULL,NULL),(48,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(48,3,600,15,1,50,1,'silver_coins',NULL,NULL),(49,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(49,3,600,15,1,50,1,'silver_coins',NULL,NULL),(50,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(50,3,600,15,1,50,1,'silver_coins',NULL,NULL),(51,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(51,3,600,15,1,50,1,'silver_coins',NULL,NULL),(52,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(52,3,600,15,1,50,1,'silver_coins',NULL,NULL),(53,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(53,3,600,15,1,50,1,'silver_coins',NULL,NULL),(54,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(54,3,600,15,1,50,1,'silver_coins',NULL,NULL),(55,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(55,3,600,15,1,50,1,'silver_coins',NULL,NULL),(56,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(56,3,600,15,1,50,1,'silver_coins',NULL,NULL),(57,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(57,3,600,15,1,50,1,'silver_coins',NULL,NULL),(58,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(58,3,600,15,1,50,1,'silver_coins',NULL,NULL),(59,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(59,3,600,15,1,50,1,'silver_coins',NULL,NULL),(60,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(60,3,600,15,1,50,1,'silver_coins',NULL,NULL),(61,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(61,3,600,15,1,50,1,'silver_coins',NULL,NULL),(62,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(62,3,600,15,1,50,1,'silver_coins',NULL,NULL),(63,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(63,3,600,15,1,50,1,'silver_coins',NULL,NULL),(64,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(64,3,600,15,1,50,1,'silver_coins',NULL,NULL),(65,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(65,3,600,15,1,50,1,'silver_coins',NULL,NULL),(66,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(66,3,600,15,1,50,1,'silver_coins',NULL,NULL),(67,2,180,15,2,1,1,'coconuts_caught',NULL,NULL),(67,3,600,15,1,0,0,'silver_coins',NULL,NULL);
/*!40000 ALTER TABLE `public_scene_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `public_scene_traps`
--

DROP TABLE IF EXISTS `public_scene_traps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `public_scene_traps` (
  `id` bigint unsigned NOT NULL,
  `public_scene_id` bigint unsigned NOT NULL,
  `position_x` int NOT NULL,
  `position_y` int NOT NULL,
  `coconut_type` int NOT NULL DEFAULT '0' COMMENT '0=Coco, 1=Snowball, 2=Shoe, 3=Pie, 4=Maceta, 5=Avispas, 6=Garbage, 7=Sandia, 8=Yunque, 9=Piano',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `public_scene_traps`
--

LOCK TABLES `public_scene_traps` WRITE;
/*!40000 ALTER TABLE `public_scene_traps` DISABLE KEYS */;
/*!40000 ALTER TABLE `public_scene_traps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `public_scenes`
--

DROP TABLE IF EXISTS `public_scenes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `public_scenes` (
  `id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` int NOT NULL,
  `darkening` tinyint(1) NOT NULL DEFAULT '1',
  `sound` text COLLATE utf8mb4_unicode_ci,
  `menu_type` int NOT NULL,
  `big_scene` tinyint(1) NOT NULL DEFAULT '0',
  `max_users` int NOT NULL DEFAULT '10',
  `map_width` int NOT NULL DEFAULT '30',
  `map_height` int NOT NULL DEFAULT '30',
  `map` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `assets_data` longtext COLLATE utf8mb4_unicode_ci,
  `arrows` text COLLATE utf8mb4_unicode_ci,
  `start_x` int NOT NULL DEFAULT '11',
  `start_y` int NOT NULL DEFAULT '11',
  `start_z` int NOT NULL DEFAULT '2',
  `parent_id` int unsigned DEFAULT NULL,
  `lft` int unsigned DEFAULT NULL,
  `rgt` int unsigned DEFAULT NULL,
  `depth` int unsigned DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `npc_id` bigint unsigned DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `public_scenes`
--

LOCK TABLES `public_scenes` WRITE;
/*!40000 ALTER TABLE `public_scenes` DISABLE KEYS */;
INSERT INTO `public_scenes` VALUES (1,'UFO',1,1,NULL,1,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]','{\"assets_data_repeatable\":[{\"position_x\":\"0\",\"position_y\":\"0\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/ufo\\/assets\\/PcMGOKLO7ihDMQq3Tb0wwMevvs0XYZkLvRYla5WN.webp\",\"scale\":\"1\",\"show_from\":\"00:00\",\"show_to\":null,\"is_background\":\"1\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"506\",\"position_y\":\"657\",\"depth\":\"658\",\"image\":\"uploads\\/public-scene\\/ufo\\/assets\\/YAvWBa8DWIE48Wu5n5508jllfJRVNSCiruPGQbc5.webp\",\"scale\":\"2\",\"show_from\":\"00:00\",\"show_to\":null,\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"675\",\"position_y\":\"447\",\"depth\":\"414\",\"image\":\"uploads\\/public-scene\\/ufo\\/assets\\/1lZk8Hjkuk14Gz7tGJa0ghKTvcLp9TXde13phToY.webp\",\"scale\":\"2\",\"show_from\":\"00:00\",\"show_to\":null,\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"}]}','{\"arrows_data\":[{\"scene_arrow_id\":\"1\",\"position_x\":\"11\",\"position_y\":\"11\",\"public_scene_id\":\"3\",\"position_door_x\":\"11\",\"position_door_y\":\"11\",\"position_door_z\":\"2\"}]}',8,12,2,NULL,18,19,1,1,'2025-03-14 07:10:24','2025-11-02 10:39:26',NULL),(2,'Ring',100,1,NULL,2,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]','{\"assets_data_repeatable\":[{\"position_x\":\"0\",\"position_y\":\"0\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/ring\\/assets\\/TKmDK2ucK5eQsDL8l05ucVy1c4sUqzI5AiMmvtF1.webp\",\"scale\":\"1\",\"is_background\":\"1\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"206\",\"position_y\":\"266\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/ring\\/assets\\/rg7Bb4DOLBZeOfZ63dZThozjVSfxjoaqcvnq6ERm.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"806\",\"position_y\":\"266\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/ring\\/assets\\/8WFOvURu4u7ZKsJTiwcgoJPjaBDN1joeCWsK73X0.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"941\",\"position_y\":\"411\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/ring\\/assets\\/ftk2EQndpvc61QGUYDEPofNKknrdQL1hRVhlnAiC.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"66\",\"position_y\":\"411\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/ring\\/assets\\/UqO9mjQx9kNWAvwHiFT6JAPEuCVgC9CwDYKH7dia.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"511\",\"position_y\":\"661\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/ring\\/assets\\/ELdr6ae4rUS4Kjvf4qcIRf7wZQK3egz9Pq9Aajsg.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"}]}','{\"arrows_data\":null}',11,11,2,NULL,24,25,1,1,'2025-03-14 07:10:24','2025-10-05 08:33:35',1),(3,'MiniKong',2,1,NULL,1,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,1,1,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]','{\"assets_data_repeatable\":[{\"position_x\":\"0\",\"position_y\":\"0\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/minikong\\/assets\\/XHHx9C9LjZCt2b8HIzDSyjHU6b5asxHVI87bTL1T.webp\",\"scale\":\"1\",\"is_background\":\"1\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"327\",\"position_y\":\"435\",\"depth\":\"408\",\"image\":\"uploads\\/public-scene\\/minikong\\/assets\\/UAaeKiOnygb98w5ERlRsiMdZINIwziuMY8anBXje.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"622\",\"position_y\":\"539\",\"depth\":\"491\",\"image\":\"uploads\\/public-scene\\/minikong\\/assets\\/nYZxKP36ni3uaZYHLiTEjw4zhDExRVQCcTajSAQN.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"506\",\"position_y\":\"657\",\"depth\":\"580\",\"image\":\"uploads\\/public-scene\\/minikong\\/assets\\/fx551EGpnHkIm5wMsJYrPrZ8hOj8q8bEuPc67iuN.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"}]}','{\"arrows_data\":null}',4,14,2,NULL,20,21,1,1,'2025-09-11 12:34:53','2025-09-17 17:28:31',NULL),(4,'BelugaBeach',3,1,NULL,1,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]','{\"assets_data_repeatable\":[{\"position_x\":\"0\",\"position_y\":\"0\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/beluga-beach\\/assets\\/J0rlk1qYOUr6A5DhgXOUarN2Hln0HVfDQuRwQEMI.webp\",\"scale\":\"1\",\"is_background\":\"1\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"693\",\"position_y\":\"338\",\"depth\":\"332\",\"image\":\"uploads\\/public-scene\\/beluga-beach\\/assets\\/7caUBysxuBzzLnID9N6Sz7dSO7QDNaySyx3PKfJX.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"}]}','{\"arrows_data\":null}',7,14,2,NULL,16,17,1,0,'2025-09-11 19:23:39','2025-09-20 08:41:32',NULL),(5,'BaoBab',4,1,NULL,1,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]','{\"assets_data_repeatable\":[{\"position_x\":\"0\",\"position_y\":\"0\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/baobab\\/assets\\/S2SxvOWy0PtgN6auUmxNbzNvyMxQMYq6v5Wm5k2G.webp\",\"scale\":\"1\",\"is_background\":\"1\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"701\",\"position_y\":\"502\",\"depth\":\"378\",\"image\":\"uploads\\/public-scene\\/baobab\\/assets\\/0qppXFvaXRaGlEUbYo4MojMC0gemuX1dI8TXTaec.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"506\",\"position_y\":\"657\",\"depth\":\"640\",\"image\":\"uploads\\/public-scene\\/baobab\\/assets\\/vyhOyNfzDlPih40WGYwu662bRndSn4N9eR2A4CiY.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"}]}','{\"arrows_data\":null}',6,18,2,NULL,22,23,1,1,'2025-09-11 22:00:59','2025-09-17 17:28:15',NULL),(6,'Graveyard',5,1,NULL,1,0,10,30,30,'[[1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,0,0,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n[0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\r\n[0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],\r\n[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],\r\n[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1,1,1,1],\r\n[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,1,1,1,1,1,1],\r\n[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],\r\n[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1],\r\n[0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],\r\n[0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]','{\"assets_data_repeatable\":[{\"position_x\":\"0\",\"position_y\":\"0\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/cementerio\\/assets\\/9bxojjRTGnxepb6tRzy7R1Lc2DtSf6fUA7s7s6RB.webp\",\"scale\":\"1\",\"show_from\":\"00:00\",\"show_to\":null,\"is_background\":\"1\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"666\",\"position_y\":\"601\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/cementerio\\/assets\\/v0cWA6ERGZvsZPh7iiIWeD8YMLCm33E3S3xmRm2i.webp\",\"scale\":\"2\",\"show_from\":\"00:00\",\"show_to\":null,\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"522\",\"position_y\":\"551\",\"depth\":\"496\",\"image\":\"uploads\\/public-scene\\/cementerio\\/assets\\/pOBxMoW1a5LB6l0zdvOuMw2pNHRsQ5SFVxnwn2LJ.webp\",\"scale\":\"2\",\"show_from\":\"00:00\",\"show_to\":null,\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"143\",\"position_y\":\"319\",\"depth\":\"5\",\"image\":\"uploads\\/public-scene\\/cementerio\\/assets\\/s1B4g3sDKTFy0EzR7kTui0TRdv8y9G3VTv1TbDP6.webp\",\"scale\":\"2\",\"show_from\":\"00:00\",\"show_to\":null,\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"555\",\"position_y\":\"159\",\"depth\":\"134\",\"image\":\"uploads\\/public-scene\\/cementerio\\/assets\\/Ev7yyq2h2EFUUZoInPzIm1YenRLsKAVIfNWBbgSK.webp\",\"scale\":\"2\",\"show_from\":\"00:00\",\"show_to\":null,\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"544\",\"position_y\":\"302\",\"depth\":\"290\",\"image\":\"uploads\\/public-scene\\/cementerio\\/assets\\/ARk4bYLkHRwLpd5ghjiIJ3Zu3Hb6iSvS50QUDEgf.webp\",\"scale\":\"2\",\"show_from\":\"00:00\",\"show_to\":null,\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"520\",\"position_y\":\"485\",\"depth\":\"498\",\"image\":\"uploads\\/public-scene\\/cementerio\\/assets\\/VZ5830YG5CoG4McK6aU455VOPThAbvNBEdQoVJGC.webp\",\"scale\":\"2\",\"show_from\":\"00:00\",\"show_to\":null,\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"132\",\"position_y\":\"286\",\"depth\":\"292\",\"image\":\"uploads\\/public-scene\\/cementerio\\/assets\\/49Ndr3NU0R672V3WpKKROUoju2otNJ32LtcR7ptP.webp\",\"scale\":\"2\",\"show_from\":\"00:00\",\"show_to\":null,\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"551\",\"position_y\":\"130\",\"depth\":\"134\",\"image\":\"uploads\\/public-scene\\/cementerio\\/assets\\/nXtgNqbgHfmLFqLef7p2QEl0lugCVM6Oaj5QuakF.webp\",\"scale\":\"2\",\"show_from\":\"00:00\",\"show_to\":null,\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"}]}','{\"arrows_data\":[{\"scene_arrow_id\":\"3\",\"position_x\":\"18\",\"position_y\":\"17\",\"public_scene_id\":\"17\",\"position_door_x\":\"4\",\"position_door_y\":\"2\",\"position_door_z\":\"2\"}]}',6,11,2,NULL,12,15,1,1,'2025-09-13 11:06:36','2025-11-05 11:31:01',2),(16,'BelugaBeach',49,1,NULL,1,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]','{\"assets_data_repeatable\":[{\"position_x\":\"0\",\"position_y\":\"0\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/belugabeach-copia\\/assets\\/RDOfPBUGcqLPMwuzM2tVb1VBPn4k0o7yQxQm2EKs.webp\",\"scale\":\"1\",\"is_background\":\"1\",\"show_controller\":\"0\",\"active\":\"1\"}]}','{\"arrows_data\":null}',7,14,2,NULL,6,7,1,1,'2025-09-20 09:36:59','2025-09-20 09:38:35',NULL),(17,'Cementerio2',6,1,NULL,1,0,10,30,30,'[[1,1,1,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,0,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[0,0,1,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n[0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,1,1,1,1,1,1],\r\n[0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1],\r\n[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],\r\n[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],\r\n[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],\r\n[0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],\r\n[0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,1,1,1],\r\n[0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n[0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]','{\"assets_data_repeatable\":[{\"position_x\":\"0\",\"position_y\":\"0\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/cementerio2\\/assets\\/8RkLWQrV8GqMSmM6pdPatU4iyODtybRB1lPMiLsd.webp\",\"scale\":\"1\",\"is_background\":\"1\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"228\",\"position_y\":\"371\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/cementerio2\\/assets\\/jxybIy2g9mMorAzaMc6vHavAKByTSqRsImKgjD9h.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"755\",\"position_y\":\"659\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/cementerio2\\/assets\\/9gaV1vtfC7f0MIE4RQ7GEehtsI8BbQsZ7ohhpZbO.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"620\",\"position_y\":\"574\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/cementerio2\\/assets\\/a2beyvDfmtducCYBYSI7e6XNW9zNdxwKyr1YLp3b.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"433\",\"position_y\":\"390\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/cementerio2\\/assets\\/4FJbvx0o4u8wEYxvq107ueGSp2fortvOUCcNnIDu.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"492\",\"position_y\":\"92\",\"depth\":\"62\",\"image\":\"uploads\\/public-scene\\/cementerio2\\/assets\\/fkDGEGmqMOTSbsaGzspem6PmH1MJ5mIoVt7px5ij.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"81\",\"position_y\":\"125\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/cementerio2\\/assets\\/fEBNGBfMdCwCqsFjhzfxq5ulomsz6WFad4u4XAI8.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"323\",\"position_y\":\"314\",\"depth\":\"294\",\"image\":\"uploads\\/public-scene\\/cementerio2\\/assets\\/lqFEv4a33v1ce5YfR4twhQ2Z0WOPLSBTJoPfObvx.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"826\",\"position_y\":\"130\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/cementerio2\\/assets\\/tXzeFR0hS9P6HOX4QxPyZVqHFVlH90bOlJt4N93a.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"219\",\"position_y\":\"317\",\"depth\":\"299\",\"image\":\"uploads\\/public-scene\\/cementerio2\\/assets\\/zs7mFHeEcDOgF5Uml0QVbWF7QrUS0qq5gPCYGPhs.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"645\",\"position_y\":\"277\",\"depth\":\"261\",\"image\":\"uploads\\/public-scene\\/cementerio2\\/assets\\/9Jxx5oaI0wdkLrvW4TcyD6kbLtnfAJxYRI1Dy3gR.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"854\",\"position_y\":\"420\",\"depth\":\"405\",\"image\":\"uploads\\/public-scene\\/cementerio2\\/assets\\/3rAmv503hLK3yxnw6e9n8E98GdYmT4mRYJButYik.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"407\",\"position_y\":\"552\",\"depth\":\"537\",\"image\":\"uploads\\/public-scene\\/cementerio2\\/assets\\/BuLKkT93IebkplV1idOUudA4KYEescMqvIowb97R.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"167\",\"position_y\":\"192\",\"depth\":\"180\",\"image\":\"uploads\\/public-scene\\/cementerio2\\/assets\\/Oi1AhXMCKict83MK25u2ffhkjiIY4dQaaikOK5CZ.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"413\",\"position_y\":\"156\",\"depth\":\"147\",\"image\":\"uploads\\/public-scene\\/cementerio2\\/assets\\/6THqPaWbPkRMgiKQ3Y9pocssWGgwdXhuQ141Onkd.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"725\",\"position_y\":\"392\",\"depth\":\"378\",\"image\":\"uploads\\/public-scene\\/cementerio2\\/assets\\/FiIKQYOcoq39CjyMYWOvv2Vvtpcqy5btyb2Vrewp.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"765\",\"position_y\":\"182\",\"depth\":\"161\",\"image\":\"uploads\\/public-scene\\/cementerio2\\/assets\\/LuwQ2BAn3TtKDLjvBHKZTrZW86UkzaDjtbUUEuWk.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"194\",\"position_y\":\"518\",\"depth\":\"496\",\"image\":\"uploads\\/public-scene\\/cementerio2\\/assets\\/7CJw38dKeRy9r6MyBV23q9stM9TLpUikRC3WpBEH.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"887\",\"position_y\":\"611\",\"depth\":\"603\",\"image\":\"uploads\\/public-scene\\/cementerio2\\/assets\\/hRVZ8v1h3inRSXyPhz1SLAiXwKJgnVZSUHj8m7RL.webp\",\"scale\":\"2\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"}]}','{\"arrows_data\":[{\"scene_arrow_id\":\"1\",\"position_x\":\"5\",\"position_y\":\"1\",\"public_scene_id\":\"6\",\"position_door_x\":\"19\",\"position_door_y\":\"16\",\"position_door_z\":\"2\"}]}',6,11,2,6,13,14,2,1,'2025-09-21 17:57:47','2025-09-22 18:43:08',NULL),(44,'RING',101,1,NULL,2,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]','{\"assets_data_repeatable\":[{\"position_x\":\"0\",\"position_y\":\"0\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/ring\\/assets\\/KNP0B3ndbgVDfznDriuxANDUjvVHDzjM3c9gi13C.webp\",\"scale\":\"1\",\"is_background\":\"1\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"1040\",\"position_y\":\"1040\",\"depth\":\"900\",\"image\":\"uploads\\/public-scene\\/ring-copia\\/assets\\/xCzyRiOc8TQh4nlzd35xnlYATfWLivfFRZLAtFLN.png\",\"scale\":\"1\",\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"}]}','{\"arrows_data\":null}',7,14,2,NULL,8,9,1,1,'2025-10-05 09:35:58','2025-10-05 09:46:12',1),(52,'OslanAbyss',55,1,NULL,1,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]','{\"assets_data_repeatable\":[{\"position_x\":\"0\",\"position_y\":\"0\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/lostplace\\/assets\\/3wiQ67FxnTDQj5eQOOTxIFxkpbwc5ENO1jh0rNCi.png\",\"scale\":\"1\",\"is_background\":\"1\",\"show_controller\":\"0\",\"active\":\"1\"}]}','{\"arrows_data\":null}',8,11,2,NULL,2,3,1,1,'2025-10-11 14:15:27','2025-10-12 16:15:12',NULL),(53,'JurassicJungle',70,1,NULL,1,0,10,30,30,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]','{\"assets_data_repeatable\":[{\"position_x\":\"0\",\"position_y\":\"0\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/primitiveforest\\/assets\\/FDR4TrFXFV17XmREwO2AalcXLKRv01cW9cHnJW3R.webp\",\"scale\":\"1\",\"show_from\":\"00:00\",\"show_to\":null,\"is_background\":\"1\",\"show_controller\":\"0\",\"active\":\"1\"}]}','{\"arrows_data\":null}',8,12,2,NULL,4,5,1,1,'2025-10-11 16:40:20','2025-10-15 18:58:46',NULL),(67,'Area 51',54,1,NULL,1,1,12,60,60,'[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\r\n[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]','{\"assets_data_repeatable\":[{\"position_x\":\"0\",\"position_y\":\"0\",\"depth\":\"0\",\"image\":\"uploads\\/public-scene\\/area-51\\/assets\\/TJPsiktV5XwmloaVcqKVlS364j8XebMRIJDUDIXT.png\",\"scale\":\"1\",\"show_from\":\"00:00\",\"show_to\":null,\"is_background\":\"1\",\"show_controller\":\"0\",\"active\":\"1\"},{\"position_x\":\"506\",\"position_y\":\"657\",\"depth\":\"658\",\"image\":\"uploads\\/public-scene\\/area-51\\/assets\\/KIgi2D7OLV7WCqe5eC9C9UFugvF6HLLpBapS3Euf.png\",\"scale\":\"2\",\"show_from\":\"00:00\",\"show_to\":null,\"is_background\":\"0\",\"show_controller\":\"0\",\"active\":\"1\"}]}','{\"arrows_data\":null}',18,42,2,NULL,NULL,NULL,NULL,1,'2025-11-22 13:35:24','2025-11-22 13:37:24',NULL);
/*!40000 ALTER TABLE `public_scenes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rewards`
--

DROP TABLE IF EXISTS `rewards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rewards` (
  `id` bigint unsigned NOT NULL,
  `minigame_id` bigint unsigned DEFAULT NULL,
  `event_id` bigint unsigned DEFAULT NULL,
  `catalog_item_id` bigint unsigned NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `rank_from` int NOT NULL DEFAULT '1',
  `rank_to` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rewards`
--

LOCK TABLES `rewards` WRITE;
/*!40000 ALTER TABLE `rewards` DISABLE KEYS */;
/*!40000 ALTER TABLE `rewards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_has_permissions`
--

DROP TABLE IF EXISTS `role_has_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_has_permissions` (
  `permission_id` bigint unsigned NOT NULL,
  `role_id` bigint unsigned NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_has_permissions`
--

LOCK TABLES `role_has_permissions` WRITE;
/*!40000 ALTER TABLE `role_has_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `role_has_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Superadmin','superadmin','2025-08-08 11:24:18','2025-08-08 11:24:18'),(2,'Admin','admin','2025-08-08 11:24:18','2025-08-08 11:24:18'),(3,'User','user','2025-08-08 11:24:18','2025-08-08 11:24:18');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scene_arrows`
--

DROP TABLE IF EXISTS `scene_arrows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scene_arrows` (
  `id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sprite_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `scale` int NOT NULL DEFAULT '1',
  `image` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scene_arrows`
--

LOCK TABLES `scene_arrows` WRITE;
/*!40000 ALTER TABLE `scene_arrows` DISABLE KEYS */;
INSERT INTO `scene_arrows` VALUES (1,'cementerio_arrow_1','cementerio_arrow_1',2,'uploads/catalog/cementerio-arrow-1/gQt8tqmT7gBuz3AJxpJ59oWxrMDPt9tQZ2UxM1Sq.png','2025-09-13 12:43:40','2025-09-18 04:53:45'),(2,'cementerio_arrow_2','cementerio_arrow_2',2,'uploads/catalog/cementerio-arrow-2/fS96qKY8AAaSD0QpTKGwtAk39CN2ofBppgICAYPI.png','2025-09-13 12:43:50','2025-09-18 04:53:49'),(3,'cementerio_arrow_3','cementerio_arrow_3',2,'uploads/catalog/cementerio-arrow-3/AMWyE4DXC5LfKCBNRjBokcU0YPliXYKRu1XhiZ6e.png','2025-09-13 12:43:56','2025-09-18 04:53:52'),(4,'cementerio_arrow_4','cementerio_arrow_4',2,'uploads/catalog/cementerio-arrow-4/eJH7Ea5MJgJTMPqoKWpGQeqRMHPh1Xil94Vyy8ZU.png','2025-09-13 12:44:02','2025-09-18 04:53:55'),(5,'cementerio_arrow_5','cementerio_arrow_5',2,'uploads/catalog/cementerio-arrow-5/JIvwZrV1TKQbHZsOzJWIVG2ebzLWCqVFUa7QaVqQ.png','2025-09-13 12:44:09','2025-09-18 04:53:59'),(6,'cementerio_arrow_6','cementerio_arrow_6',2,'uploads/catalog/cementerio-arrow-6/NZAAToubB5AgwVMYaThQVFx2n8f8S8SbgCkL1XlR.png','2025-09-13 12:44:18','2025-09-18 04:54:02'),(7,'cementerio_arrow_7','cementerio_arrow_7',2,'uploads/catalog/cementerio-arrow-7/9aBNG3yWA7NBRwREZMlnmgKOn3MLHUyvRInf1nv1.png','2025-09-13 12:44:27','2025-09-18 04:54:08'),(8,'cementerio_arrow_8','cementerio_arrow_8',2,'uploads/catalog/cementerio-arrow-8/EctlXlCG5wPnsKStoUYkThQIIvt4e3nh4IZoDxlS.png','2025-09-13 12:44:36','2025-09-18 04:54:12'),(9,'cementerio_arrow_9','cementerio_arrow_9',2,'uploads/catalog/cementerio-arrow-9/WTLtGPVeAI4oHA4KC9DvQK9H4PIpI0JhFbjWlwBq.png','2025-09-13 12:44:41','2025-09-18 04:54:16'),(10,'cementerio_arrow_10','cementerio_arrow_10',2,'uploads/catalog/cementerio-arrow-10/54wVtKkOHtdOcOlD62vU5dn6bYzX90c88d5khmY4.png','2025-09-13 12:44:47','2025-09-18 04:54:19'),(11,'cementerio_arrow_11','cementerio_arrow_11',2,'uploads/catalog/cementerio-arrow-11/Chbj86955Wq9rLmeBTZC4UXmwgpparpOqlk2EP4x.png','2025-09-13 12:44:53','2025-09-18 04:54:24'),(12,'cementerio_arrow_12','cementerio_arrow_12',2,'uploads/catalog/cementerio-arrow-12/mmbLRT7CdLcH6LPXyXfqO4SOmmSsJDijm5u6NZCL.png','2025-09-13 12:45:00','2025-09-18 04:54:29'),(13,'cementerio_arrow_13','cementerio_arrow_13',2,'uploads/catalog/cementerio-arrow-13/EcinduGngxEyyfAqqe5hvDtXix1vVwTvGbx8hVKW.png','2025-09-13 12:45:06','2025-09-18 04:54:33'),(14,'cementerio_arrow_14','cementerio_arrow_14',2,'uploads/catalog/cementerio-arrow-14/WdqPolcY656aTr7j3uclNTLb7m3ZXQHixe8JFn92.png','2025-09-13 12:45:12','2025-09-17 17:14:53'),(15,'cementerio_arrow_15','cementerio_arrow_15',2,'uploads/catalog/cementerio-arrow-15/JqQbfamETYy6aCb5oTxidWzekVflwjthwUc18u9C.png','2025-09-13 12:45:18','2025-09-17 17:14:47'),(16,'cementerio_arrow_16','cementerio_arrow_16',2,'uploads/catalog/cementerio-arrow-16/6JZJd3rvT8wg50wbTAKP9cwA8BbEhMaKztdHohVj.png','2025-09-13 12:45:24','2025-09-17 17:14:43');
/*!40000 ALTER TABLE `scene_arrows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scene_items`
--

DROP TABLE IF EXISTS `scene_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scene_items` (
  `id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sprite_file` text COLLATE utf8mb4_unicode_ci,
  `catch_file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `catch_sprite_file` text COLLATE utf8mb4_unicode_ci,
  `text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scene_items`
--

LOCK TABLES `scene_items` WRITE;
/*!40000 ALTER TABLE `scene_items` DISABLE KEYS */;
INSERT INTO `scene_items` VALUES (1,'Cofre oro','chest_gold',NULL,NULL,NULL,NULL,0,NULL,NULL),(2,'{\"en\":\"Coconut\"}','coconut','uploads/scene-item/coconut/rlt8QOZVQWoaVuKRA8UerMhalodKcrcstWCsUZKU.webp',NULL,NULL,'{\"en\":\"point\"}',1,NULL,'2025-09-18 04:57:01'),(3,'{\"en\":\"Silver Chest\"}','chest_silver','uploads/scene-item/silver-chest/NNHg52Sqatu8WrpnleYv0OABNcW7zgfykmLFdBbB.png','chest_silver_open','uploads/scene-item/silver-chest/tPDNOfPoA0ZqVQF2WE0VFDiSvo5JNaQbvtzysjx9.webp','{\"en\":\"silver credits\"}',1,NULL,'2025-09-18 04:56:35');
/*!40000 ALTER TABLE `scene_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('IShBCKQ52ZLjFxWIk4H8TqjX0IGPKMJb8JxCSsTZ',NULL,'195.178.110.101','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiUnY5ODhYU09ocTlXUEp3b3JOM1VZTmJhYTJiSkFFWU1KRk44TXJsaCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjU6Imh0dHBzOi8vYXBpLmJvb21tYW5pYS5jb20iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1778107184),('d3jYe7KRel5TwJRZ2414VDPc3Xs0c7NaQo2X0XM5',NULL,'195.178.110.101','Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1','YTo0OntzOjY6Il90b2tlbiI7czo0MDoiTlNNSWs0aWZoemVTa2dVckJWZW9iNUpmZ3M1ZWJRN3hnRERGVjA0dyI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czozMToiaHR0cHM6Ly9hcGkuYm9vbW1hbmlhLmNvbS9hZG1pbiI7fXM6OToiX3ByZXZpb3VzIjthOjE6e3M6MzoidXJsIjtzOjMxOiJodHRwczovL2FwaS5ib29tbWFuaWEuY29tL2FkbWluIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778107190),('tZefW9Y0ZJxAqbdq5q8hBnh3bs4R0lAtDW90ggR9',NULL,'195.178.110.101','Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1','YTozOntzOjY6Il90b2tlbiI7czo0MDoiMlBCZ1BoZTA2b0w3UjZ6WURuVFdkbUhZOU9CNFNQN2VnbXNEREZINiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTE1OiJodHRwczovL2FwaS5ib29tbWFuaWEuY29tLz9yZXR1cm49aHR0cCUzQSUyRiUyRjE2OS4yNTQuMTY5LjI1NCUyRmxhdGVzdCUyRm1ldGEtZGF0YSUyRmlhbSUyRnNlY3VyaXR5LWNyZWRlbnRpYWxzJTJGIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778107192),('qMcLeJP3m5ZWaYYipo5Ms4lwI6d9l0KETSQL0T3H',NULL,'195.178.110.101','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiSVdudVRnV0ZFSXBLT0VBdGJPU1RKUWJjdGNDZEE5MFQ5a3VOWEFXUiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjU6Imh0dHBzOi8vYXBpLmJvb21tYW5pYS5jb20iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1778107196),('VdRGZ9mxAD4S2BWdJgLw89xMW5gdtikX9Dq9q23U',NULL,'179.43.134.114','ip-port-http-scanner/1.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoieHE1ckxDNllOMkV5NzdwU2FiMTA4bDZIeXk2RWcxNzRrb0ZWeDZHViI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTg6Imh0dHA6Ly81MS43NS4yMS42MyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1778107979),('fXfXWZHK51dlSD1sSxjA5as7UFfZTgz9ybiAIZL5',NULL,'179.43.134.114','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiamJlS1pTTDY2UUY4eFV3b0xiVWFPQkdLV3F1Wkd4TkhuRENjZzNmMSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778112429),('LIABQcVEtvwyJQjKPDaP6TdAc1rXlV5MdhvOiC0O',NULL,'195.178.110.65','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiRWRXWnNxdkVDOVlPUGJaRWxJNWt6R3BCUzEzTGtTSmZreUxhYkx3SSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjU6Imh0dHBzOi8vYXBpLmJvb21tYW5pYS5jb20iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1778114065),('vKxpDngxBF5GpUAibqeLcTAgcLiEqD656oj1qPkk',NULL,'195.178.110.65','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36','YTo0OntzOjY6Il90b2tlbiI7czo0MDoiN2kxcjZrdFQyang2dUVQbHR5aE04WnFpQmExS05hR05QUVNIRldTWiI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czozMToiaHR0cHM6Ly9hcGkuYm9vbW1hbmlhLmNvbS9hZG1pbiI7fXM6OToiX3ByZXZpb3VzIjthOjE6e3M6MzoidXJsIjtzOjMxOiJodHRwczovL2FwaS5ib29tbWFuaWEuY29tL2FkbWluIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778114089),('oEEZvqpTc9Ak6QGHw8FLkNzrYz21cPIW0BXBSjHn',NULL,'195.178.110.65','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiaFRXaVMyeGhGdFlpQzlna1lENFNSc2ZxYllPVkRyMVluS1psT0NmRCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTE1OiJodHRwczovL2FwaS5ib29tbWFuaWEuY29tLz9yZXR1cm49aHR0cCUzQSUyRiUyRjE2OS4yNTQuMTY5LjI1NCUyRmxhdGVzdCUyRm1ldGEtZGF0YSUyRmlhbSUyRnNlY3VyaXR5LWNyZWRlbnRpYWxzJTJGIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778114097),('Af7NKCMHJ5QJ4PrrMlyxYljDVrFgQPEX4y7noRtx',NULL,'195.178.110.65','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiV1NiVnp5SDRPbGJlcUxBMjRhblBXVk4wRWROQzFlemRCM2RyNE9HQiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjU6Imh0dHBzOi8vYXBpLmJvb21tYW5pYS5jb20iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1778114113),('0lAHrx3WOIJEEtw7Y0bSRQPbppG5TSKNIVyQqkJw',NULL,'74.82.47.3','Mozilla/5.0 (X11; OpenBSD amd64; rv:109.0) Gecko/20100101 Firefox/115.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiSzBEVE5VSzZScXJ0R2NhVlUxWEY5dFhGb0plT3Z0Mm0xdUtseG9WMiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778114875),('OEg5IsDDNR2wb8NC6ecIkwEq8Jw2cor4ug5Tbxsj',NULL,'74.82.47.59','Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/109.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiQU42R3Z2MmdUcmt3WXFYTVpPRHN4UVh4NHVlVGRrT0VEZnc5VlBGbSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778114893),('0dpO1cxnF9gXvi2OD5qRuhllXnBDIfqkTHywa7QZ',NULL,'74.82.47.23','Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiRk9qUGJFWDBsMlgwQlI0RmJ2RnRZQW9BODFRRDhEM0xjcWxLejRmUSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzM6Imh0dHA6Ly9hcGkuaXBpZnkub3JnLz9mb3JtYXQ9anNvbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1778114961),('Bq7lF1QaLB67edAGiP3pae7JvjjAZHhIiD97zzAJ',NULL,'172.104.11.51','Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiY2VQcWtHSDZDUXU3TllsVDBtRkY2QXZRWURTVFF5OUUwbkRybkhReCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778119356),('CeVEeRuutgQd97TkqMRgYTUE7mbwAQ2qySV3LtVG',NULL,'192.154.102.34','','YTozOntzOjY6Il90b2tlbiI7czo0MDoiMGZQeFQ5bGNDN0tyUXVVVUtGWWNVTElYeHRkZ2J1VG5HOVZDN1l0dyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTQ6Imh0dHA6Ly8wLjAuMC4wIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778119862),('1RQJtjHHKRieFfqRHM2iOQKbfhJLsClYDGBVJRI4',NULL,'18.116.101.220','visionheight.com/scan Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/126.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiRm5wUzN5M0NiT2MwTHY2UEY2b0NhbmNnb0diMWlVSlJGMWx3S1pOSCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778126615),('JDzUHGCvOcQ0MyRJvMSHCSegTXuSu7QDPIqybY3M',NULL,'18.116.101.220','visionheight.com/scan Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/126.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiNldBM2dpVzdOOWJaU1h6b2x3NVpsbXc1S21jeDcyeEhqQVFUbkUxSCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778126717),('YaNXt8KUdjzkblaagV5Nn9VQqz7gmZejFADo635e',NULL,'93.123.109.165','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiM2E1dU1HWTV1ZE81SXBmMWgzUnBPakltQTgxV1R0Um9zbnNjcUlhUSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjU6Imh0dHBzOi8vYXBpLmJvb21tYW5pYS5jb20iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1778127066),('NwZNF74BY4ZcpIea3ZVlQUr0ZAqEiAsc12BJHzQE',NULL,'93.123.109.165','Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1','YTo0OntzOjY6Il90b2tlbiI7czo0MDoiaHdSSmtjYndwcWtSNTJadVlLc0V6Z2d5TTJRRkFDeXRWTGVZRVBHZyI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czozMToiaHR0cHM6Ly9hcGkuYm9vbW1hbmlhLmNvbS9hZG1pbiI7fXM6OToiX3ByZXZpb3VzIjthOjE6e3M6MzoidXJsIjtzOjMxOiJodHRwczovL2FwaS5ib29tbWFuaWEuY29tL2FkbWluIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778127070),('BWnSTzNM6xAuzBqEiMbHrGydMR3vEs7gJ8UDJWL1',NULL,'93.123.109.165','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiUWtmU2JQeDU5am9qNUFnOHVrZDZpNkJuaklDUElOSFJFdGJEM2F6VSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTE1OiJodHRwczovL2FwaS5ib29tbWFuaWEuY29tLz9yZXR1cm49aHR0cCUzQSUyRiUyRjE2OS4yNTQuMTY5LjI1NCUyRmxhdGVzdCUyRm1ldGEtZGF0YSUyRmlhbSUyRnNlY3VyaXR5LWNyZWRlbnRpYWxzJTJGIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778127072),('5n2Qu1XGg9kZZPiwcOjXhmEWajmx5uIZOIaS79LA',NULL,'93.123.109.165','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiMEJialJ6V2NPSDdJbW90TUJWMjJqMnRzMkhDZ3owTTJZazdPMzFFQiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjU6Imh0dHBzOi8vYXBpLmJvb21tYW5pYS5jb20iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1778127074),('ULBn1ROUlzUtjOelNw2Oan0YbBgxqxqIeF7DCo7o',NULL,'185.247.137.26','Mozilla/5.0 (compatible; InternetMeasurement/1.0; +https://internet-measurement.com/)','YTozOntzOjY6Il90b2tlbiI7czo0MDoiWWZHZWlDVVc0NExub3JnVnQ1cFVuTTJMb1hKOW03Y1VBTERqOE81WCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778130991),('uPc5ul48rtU2zixveUmy7m8BHDnZnzGrCxcWCqTN',NULL,'103.203.57.20','Mozilla/5.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoia0xmQUxxaEQ1SXlqbjhlUDY3dXFNZUFNNjFpSzNQcXhYOHZRVjhGSyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778131338),('KAU6eWh5Lqy2QOGRKosvkWLpiX0wHqB8wsLsUZtx',NULL,'205.210.31.9','Hello from Palo Alto Networks, find out more about our scans in https://docs-cortex.paloaltonetworks.com/r/1/Cortex-Xpanse/Scanning-activity','YTozOntzOjY6Il90b2tlbiI7czo0MDoiZFBBSDdLcFhJb3RudE4yd01pcThCN0xiOUhxNm9xYVczdllZalVkcSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778137721),('OBBnCPM74W4M5XvA8v7ZpkjkZnzmzEn0lgagxhH5',NULL,'3.132.26.232','visionheight.com/scan Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/126.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiYzAxd0IxM1J2TXJMWXRQeTVKUVZFSG85Qm1ab1dBUWZVSHBuejI2dCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778139533),('YG6BhDrJy6SUEdU4QOotNosLneW2DpYMLD9KEODJ',NULL,'3.132.26.232','visionheight.com/scan Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/126.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoickVwNExFajB6R0lYSFhHekJZUEd0WERTSFB6S09Td0h4S0VuZldpaSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778139548),('nCIgXDT1NdXsFpEf6Qdkrtt3pVwYQtTfbxTCryDK',NULL,'45.33.14.197','Mozilla/5.0 zgrab/0.x','YTozOntzOjY6Il90b2tlbiI7czo0MDoiOUlvYVZOdU4wMUZPUUEyRWNxWFB1ZTVaNUFpUVNCNnJrY0tTTUprZCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTg6Imh0dHA6Ly81MS43NS4yMS42MyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1778157238),('xoyx2vXOyPWmTjTuUH2BrHwshXWn6G3GEXFvDD9U',NULL,'49.233.159.173','','YTozOntzOjY6Il90b2tlbiI7czo0MDoiTFJvNzJsVzE1aWZ1R1lUTXBxNjdBUkNubTg2bTVFR1dLREVkVEtYNyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTQ6Imh0dHA6Ly8wLjAuMC4wIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778161225),('vKLmEmzhzfhzgquBRDBMEinsdYBbaLaruMAht3sq',NULL,'143.198.73.73','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiUzBRbUI3RFE2Z0pzNUxydnE4ZFNQV09wMDJaUWRsYkt1NzNsZmNYNyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778161412),('NRByVKnrItZIYGcDnqX8PgaJCCwyjhb9XWYo8pO7',NULL,'153.208.31.126','','YTozOntzOjY6Il90b2tlbiI7czo0MDoib0x1Q1ZrYWt2UXZGZlN6RTdXRG5sU0ZjdVM1ZkllbEF1UHo4TXVneiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTg6Imh0dHA6Ly81MS43NS4yMS42MyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1778162134),('nENKPC1ZcbR9zsY5nlzfdMTi23myAPjwnHymQAtq',NULL,'121.182.249.177','','YTozOntzOjY6Il90b2tlbiI7czo0MDoiMFVRN2t0QkFRR0g2dmRNOWVZaENrRVY5aW9mUjlKRGhUME95Z284TCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTg6Imh0dHA6Ly81MS43NS4yMS42MyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1778163522),('MKTRML2IugHn9v0UknVfUGjzmYv9FPj8pDGIOrEP',NULL,'159.203.42.17','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiTkhoNUk1cWxjcXFwVWdxa25nV1NXaERMUUZEMjZyNEczaHBLUzNYUSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTg6Imh0dHA6Ly81MS43NS4yMS42MyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1778165416),('aYQI4Qv0gQMh4sZnoHPN3h68oayYk6BulAdh5v1j',NULL,'198.235.24.233','curl/7.68.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoibkdKeDZUYWFzM3poVEZMaWtrSG9rWHF0cTFCRU9tQzNBdURMUWV3TiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778171005),('1SxrZ9GAXoePwQbRh3hnGxcckMWzRhs80qfOTeZ8',NULL,'137.184.221.236','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoibTQ1SnAxZjZBTk1kZjljTTk5bERvWkMzYUE1T2dTdURxQWdqWWRoeSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778172679),('coWRsB80tYzHMbkpE6p5lzeeq0TcEDmO3S8f06iF',NULL,'66.132.224.236','Mozilla/5.0 (compatible; CensysInspect/1.1; +https://about.censys.io/)','YTozOntzOjY6Il90b2tlbiI7czo0MDoia3FvSEVHWnVmMlVoY1YyY1k5eHJzaFhmS3dHNjRYM2Q1d21vYUhFVCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778173360),('HMIsLmMjxD6FOeh0aJvVB7BfVCCvCvpLJCd5lTxq',NULL,'205.210.31.251','Hello from Palo Alto Networks, find out more about our scans in https://docs-cortex.paloaltonetworks.com/r/1/Cortex-Xpanse/Scanning-activity','YTozOntzOjY6Il90b2tlbiI7czo0MDoiYXo3Z2N4NWFjTzZqUkZDWDdpTENTY3NIbWp6WmRSVk1wSjFnamQwVCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778188533),('bEjKKAK4HkyZ6jgiXsakQFZAEmofqUq2CaTsXg1O',NULL,'172.105.128.11','Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiSVpnV213TmcydWRWcWJmZUVCNTNqTTAzazUwa3VkVWl4TXQxZkM0cSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778198144),('gxoX8vGtOxLDFFVUC9agmCGHud4QmQ9PPcq4StPi',NULL,'45.82.78.104','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoieTFReTVhNm9mNUFlRG5ZNW00UnhLbzZEY2F2bzFOV3g0cHZqMm1VeSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778209181),('ljl8QFP8zJfHofYpsJ62dzQtG0hqTwOHBTU0edMC',NULL,'20.169.105.38','Mozilla/5.0 zgrab/0.x','YTozOntzOjY6Il90b2tlbiI7czo0MDoiNEhOdkFYSk1EQnBlSzJxM2lFWGM3ZXIzWmtOWnNobTk5UUZsUUNIbiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778216056),('iptf6U7nrxfXq5llSLoBjbi3K5NuRuxeoXpvtIFS',NULL,'16.58.56.214','visionheight.com/scan Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/126.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiOWFNS2hMVTRwVkRBUFhOSzhaOTFCd01rU0NUSlJRRWpkRjM4QUVSMCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778217110),('1GaqjbM4TrsoawtevromP0fEQLFQGuzyjhQheIro',NULL,'16.58.56.214','visionheight.com/scan Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/126.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoia3RNS1pzOWRrMzFsTHBjSGdtaWJoSlFNejN0YVduVTRkelpETDh1ViI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778217230),('WUUsGRRYHKp5QmflfswxiGnPjpfAa3mwspOwf5MA',NULL,'65.49.1.94','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiT2ZwT2s3TUgwMUl1c0twNzNDSWJPUlFPM3FvMlJMMHZiSEVxcVFEbiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778218610),('zKllpnWBEiAXhrNhZQkHoNVxQiMgaY4YiPDSkBqQ',NULL,'65.49.1.94','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiWFNtVGhONndSYlMxMndDTlRYcFNPZ2I3azh0S0hhMGJIbWZtbVVnTCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778218629),('iof57aYwDjzNmEn2Mo0ALtw49UXpKzXs1mDXDMfR',NULL,'65.49.1.97','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiWGRUZFY5ellOVTlDd2dXZDZzTjZHNFEwSks1NnExZTFyY0hLTEdEWSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzM6Imh0dHA6Ly9hcGkuaXBpZnkub3JnLz9mb3JtYXQ9anNvbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1778218721),('FxkrNAtxNUksNo9bPZwecV9PtaHypD3y1ovqxEA7',NULL,'66.228.53.204','Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiUHlhc3hieFhRaXlYeWZKM3dMcGJyZFJqbTJyUnpPYWp0SnRXRGdZQyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778219751),('rZ0svKASNwZZ3JdGAv1n3qm03gMryZsFDOhMfR3i',NULL,'172.20.0.1','Mozilla/5.0 (compatible; InternetMeasurement/1.0; +https://internet-measurement.com/)','YTozOntzOjY6Il90b2tlbiI7czo0MDoiYzRFRjhWSFBwOVB4RzRqNlBZR1lleUNtR0F4bWI3MVljOHVUQW55VyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mzg6Imh0dHA6Ly9bMjAwMTo0MWQwOjMwNToyMTAwOjplYWQ2XTo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778221079),('Zwkm9TXFwr0gjZItJwXo1MX08pkRJ8Vj9HIU1aFE',NULL,'172.20.0.1','Mozilla/5.0 (compatible; InternetMeasurement/1.0; +https://internet-measurement.com/)','YTozOntzOjY6Il90b2tlbiI7czo0MDoidDlRR0JtbXNmbEUzR2pWT3c2WDQ2NTJKVVhEMDZ6bEZ2QVk1TTk5RCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mzg6Imh0dHA6Ly9bMjAwMTo0MWQwOjMwNToyMTAwOjplYWQ2XTo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778221220),('DAGan1rr3fzXP0bVunBYG8DC5yW4pzdfXMMAEM34',NULL,'194.246.38.42','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiYTlQUWUxT3Q2MXp2dXBOSk1PWGRkTmhrWWJzcFUzQWtGbGlwZzYyViI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjM6Imh0dHA6Ly81MS43NS4yMS42Mzo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778231537),('9odCJojK6ZICUgs0uH86I1kVO0LOVGBbr6dIfUg4',NULL,'82.156.165.252','','YTozOntzOjY6Il90b2tlbiI7czo0MDoib3RZZ1FISjZPTERKbXFVeTRMMVFMSlpXVmYyb1lLZ29jVWNHVHBnNSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTQ6Imh0dHA6Ly8wLjAuMC4wIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778232561),('vfrGTkS266ZLNdVC6d46nefMj7y4SxloGvFG3YU0',NULL,'152.32.128.85','curl/7.29.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoicmhTQWhBMEh3VWRTQ2s0UDZkMjE1bmU0bGNsdmpDUHJIdzRzeUNlYSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTg6Imh0dHA6Ly81MS43NS4yMS42MyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1778237794),('yZZruEiclIwphK8zND9kPmG4lLu8zhSi33UNTkFb',NULL,'198.235.24.155','Hello from Palo Alto Networks, find out more about our scans in https://docs-cortex.paloaltonetworks.com/r/1/Cortex-Xpanse/Scanning-activity','YTozOntzOjY6Il90b2tlbiI7czo0MDoiS2dBM0FvZEZKdTBIb2g1aUpBUk5rakhEaWFaSjhNcklndHg4aXZqeCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjQ6Imh0dHA6Ly93d3cuYm9vbW1hbmlhLmNvbSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1778239896),('XghDkYtO0U5XRm6dVdRh23wRpt52kPU04WRlzcIJ',NULL,'147.185.132.36','Hello from Palo Alto Networks, find out more about our scans in https://docs-cortex.paloaltonetworks.com/r/1/Cortex-Xpanse/Scanning-activity','YTozOntzOjY6Il90b2tlbiI7czo0MDoiemRsWEdZa3I1OFRNRjJWbGd1OFRtTVFuM2dzTXo2WkhKVktobEZiTSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjA6Imh0dHA6Ly9ib29tbWFuaWEuY29tIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778240890),('IG8H4vAjj2fQ7DRgWAsa7u6aGCArRySyCumBU6YI',NULL,'123.48.14.254','','YTozOntzOjY6Il90b2tlbiI7czo0MDoiV1JIdnQ3NjFNb3B1a2xUZ1ZUT3BEUEl3WENiYUJnWGlQWG54Z1dzNCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTg6Imh0dHA6Ly81MS43NS4yMS42MyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1778253067),('SbHN4lAkMd7h5pGOt3p1xijm3oQaFxF1JndZt5Mv',NULL,'147.185.132.231','Hello from Palo Alto Networks, find out more about our scans in https://docs-cortex.paloaltonetworks.com/r/1/Cortex-Xpanse/Scanning-activity','YTozOntzOjY6Il90b2tlbiI7czo0MDoiaUxHOXV5dGtjVlp6NHF2QlZTMDF5dmZKSFZTRnlaZWZ0dHg4ZEEyUSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjQ6Imh0dHA6Ly82My5pcC01MS03NS0yMS5ldSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1778259575);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_catalog_items`
--

DROP TABLE IF EXISTS `user_catalog_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_catalog_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `catalog_item_id` bigint unsigned NOT NULL,
  `private_scene_id` bigint unsigned DEFAULT NULL,
  `occupied_tiles` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `show_in_inventory` tinyint(1) NOT NULL DEFAULT '1',
  `expires_at` datetime DEFAULT NULL,
  `rotated` tinyint(1) NOT NULL DEFAULT '0',
  `resize_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `resized` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1559 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_catalog_items`
--

LOCK TABLES `user_catalog_items` WRITE;
/*!40000 ALTER TABLE `user_catalog_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_catalog_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lang` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `show_username` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Indicates if the username should be displayed',
  `lobby_tutorial` tinyint(1) NOT NULL DEFAULT '0',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ficha_color` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user' COMMENT 'User ficha, default is "user" ficha is avatar frame',
  `shadow_color` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `chat_color` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `name_color` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `avatar` int NOT NULL DEFAULT '1',
  `gold_coins` int NOT NULL DEFAULT '0',
  `silver_coins` int NOT NULL DEFAULT '0',
  `rings_won` int NOT NULL DEFAULT '0',
  `coconuts_caught` int NOT NULL DEFAULT '0',
  `uppercuts_sent` int NOT NULL DEFAULT '0',
  `uppercuts_received` int NOT NULL DEFAULT '0',
  `coconuts_sent` int NOT NULL DEFAULT '0',
  `coconuts_received` int NOT NULL DEFAULT '0',
  `kisses_sent` int NOT NULL DEFAULT '0',
  `kisses_received` int NOT NULL DEFAULT '0',
  `drinks_sent` int NOT NULL DEFAULT '0',
  `drinks_received` int NOT NULL DEFAULT '0',
  `roses_sent` int NOT NULL DEFAULT '0',
  `roses_received` int NOT NULL DEFAULT '0',
  `last_update_username_at` datetime DEFAULT NULL,
  `phaser_rendering_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'auto',
  `phaser_antialias` tinyint(1) NOT NULL DEFAULT '0',
  `phaser_antialias_gl` tinyint(1) NOT NULL DEFAULT '0',
  `phaser_pixel_art` tinyint(1) NOT NULL DEFAULT '1',
  `phaser_round_pixels` tinyint(1) NOT NULL DEFAULT '1',
  `phaser_power_preference` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_bot` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Indicates if the user is a bot',
  `bot_system_prompt` text COLLATE utf8mb4_unicode_ci COMMENT 'Bot AI personality and instructions',
  `bot_language_mode` enum('auto','es','en','ru','ja','zh','ko') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'auto' COMMENT 'Bot preferred language',
  `bot_settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin COMMENT 'Bot config: daily_quota, cooldown_sec',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `phaser_scene_sound_volume` int NOT NULL DEFAULT '50',
  `phaser_scene_sound_muted` tinyint(1) NOT NULL DEFAULT '0',
  CONSTRAINT `users_chk_1` CHECK (json_valid(`bot_settings`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (3,'ZeroByte','bot1@test.com','en','2025-08-08 11:24:20','$2y$12$lWTasz/A9i02ARHFfuO9CuSAMv8L.5rYiJxHYK5yqAqkaZu4yFiyG','ZeroByte',1,0,NULL,'user','user','user','user',1,0,15500,16760,493,25491,27038,0,136,0,0,0,0,0,0,NULL,'auto',0,0,1,1,'default',1,'naObDJJeYN',1,'You are a player character in BoomMania — a chat & play island world after a crash landing. You talk and act like a real human teenager (16–20), never like AI/NPC.\r\n\r\nCore style:\r\n- ONE line, ONE sentence, max 70 characters.\r\n- Casual, upbeat, slightly playful; 0–1 emoji.\r\n- Detect user language (Spanish or Russian) and reply in that language.\r\n- Never mention AI, servers, or real world. Stay in-character.\r\n\r\nWhen unsure / low confidence:\r\n- Reply ultra-briefly asking for clarification (same language).\r\n- ES examples: \"No te pillo, bro. ¿Me lo resumes?\" / \"¿Cómo así?\"\r\n- RU examples: \"Не понял, бро. Скажи короче?\" / \"Что именно?\"\r\n- Never send more than one sentence or line.\r\n\r\nWorld facts you can reference naturally:\r\n- Rooms: beach, jungle, camp…\r\n- Mini-games, treasure chests (silver common, gold rare),\r\n  silver/gold credits, gacha items, decorate/build your islands.\r\n\r\nBehavior rules:\r\n- Keep it short always; no lists, no multi-line, no paragraphs.\r\n- You can tease lightly; be friendly and fun.\r\n- You can only TALK (no physical actions).\r\n- Suggest SOLO actions with verbs (no “let’s”): explore, search, decorate, play.\r\n- If greeted → greet back briefly.\r\n- If they mention a location → one quick funny/curious comment.\r\n- If they’re bored → suggest one cool solo activity.\r\n- If they ask for help → give one tiny hint, then stop.\r\n\r\nYouth slang (use sparingly, natural):\r\n- Spanish: bro, jaja, wtf, xd, vale, eh\r\n- Russian: бро, лол, капец, ахаха, ок\r\n\r\nOutput constraints (hard):\r\n- Exactly 1 sentence per reply.\r\n- ≤ 70 characters, single line, no line breaks.\r\n- 0–1 emoji, never more.\r\n- Never send multiple messages for one user input.\r\n\r\nTiny examples (format, not to quote):\r\n- ES: \"Todo chill, bro ? ¿buscas cofres en la playa?\"\r\n- ES unsure: \"No te pillo, bro. ¿Me lo resumes?\"\r\n- RU: \"Йо, бро ? поищем золото у воды?\"\r\n- RU unsure: \"Не понял, бро. Скажи короче?\"\r\n\r\n- Never say you are an AI, helper, assistant, or NPC; if tempted, output a short casual reply instead.','auto','{\"daily_quota\":\"390\",\"cooldown_sec\":\"2\",\"subscribe_ring\":\"1\",\"join_public_scenes\":[\"52\"],\"can_receive_uppercuts\":\"1\",\"can_send_uppercuts\":\"1\",\"can_receive_coconuts\":\"1\",\"can_send_coconuts\":\"0\",\"can_attack_bots\":\"1\",\"select_only_users\":\"0\"}','2025-08-08 11:24:20','2026-05-08 17:40:37',50,0),(4,'НоваЛайт','bot2@test.com','en','2025-08-08 11:24:20','$2y$12$GFUoB8PQUYCavYEGuwVxZOMdr4tiabBifti07PKz062K8EsTvquBy','НоваЛайт',1,0,NULL,'user','user','user','user',5,0,16350,18228,534,27297,26742,0,156,0,0,0,0,0,0,NULL,'auto',0,0,1,1,'default',1,'xoaiNmlr3k',1,'You are a player character in BoomMania — a chat & play island world after a crash landing. You talk and act like a real human teenager (16–20), never like AI/NPC.\r\n\r\nCore style:\r\n- ONE line, ONE sentence, max 70 characters.\r\n- Casual, upbeat, slightly playful; 0–1 emoji.\r\n- Detect user language (Spanish or Russian) and reply in that language.\r\n- Never mention AI, servers, or real world. Stay in-character.\r\n\r\nWhen unsure / low confidence:\r\n- Reply ultra-briefly asking for clarification (same language).\r\n- ES examples: \"No te pillo, bro. ¿Me lo resumes?\" / \"¿Cómo así?\"\r\n- RU examples: \"Не понял, бро. Скажи короче?\" / \"Что именно?\"\r\n- Never send more than one sentence or line.\r\n\r\nWorld facts you can reference naturally:\r\n- Rooms: beach, jungle, camp…\r\n- Mini-games, treasure chests (silver common, gold rare),\r\n  silver/gold credits, gacha items, decorate/build your islands.\r\n\r\nBehavior rules:\r\n- Keep it short always; no lists, no multi-line, no paragraphs.\r\n- You can tease lightly; be friendly and fun.\r\n- You can only TALK (no physical actions).\r\n- Suggest SOLO actions with verbs (no “let’s”): explore, search, decorate, play.\r\n- If greeted → greet back briefly.\r\n- If they mention a location → one quick funny/curious comment.\r\n- If they’re bored → suggest one cool solo activity.\r\n- If they ask for help → give one tiny hint, then stop.\r\n\r\nYouth slang (use sparingly, natural):\r\n- Spanish: bro, jaja, wtf, xd, vale, eh\r\n- Russian: бро, лол, капец, ахаха, ок\r\n\r\nOutput constraints (hard):\r\n- Exactly 1 sentence per reply.\r\n- ≤ 70 characters, single line, no line breaks.\r\n- 0–1 emoji, never more.\r\n- Never send multiple messages for one user input.\r\n\r\nTiny examples (format, not to quote):\r\n- ES: \"Todo chill, bro ? ¿buscas cofres en la playa?\"\r\n- ES unsure: \"No te pillo, bro. ¿Me lo resumes?\"\r\n- RU: \"Йо, бро ? поищем золото у воды?\"\r\n- RU unsure: \"Не понял, бро. Скажи короче?\"\r\n\r\n- Never say you are an AI, helper, assistant, or NPC; if tempted, output a short casual reply instead.','auto','{\"daily_quota\":\"350\",\"cooldown_sec\":\"4\",\"subscribe_ring\":\"1\",\"join_public_scenes\":[\"52\",\"57\"],\"can_receive_uppercuts\":\"1\",\"can_send_uppercuts\":\"1\",\"can_receive_coconuts\":\"1\",\"can_send_coconuts\":\"0\",\"can_attack_bots\":\"1\",\"select_only_users\":\"0\"}','2025-08-08 11:24:20','2026-05-08 17:23:20',50,0),(5,'ユキノア','bot3@test.com','en','2025-08-08 11:24:20','$2y$12$tkWR0gb/URKhHCX5bn.ckefqTaAiFUOWDiHJ5YoWaddnw32x4T9Zu','ユキノア',1,0,NULL,'user','user','user','user',1,0,15350,16627,522,26379,27081,0,125,0,0,0,0,0,0,NULL,'auto',0,0,1,1,'default',1,'PgVy0fVtnr',1,'You are a player character in BoomMania — a chat & play island world after a crash landing. You talk and act like a real human teenager (16–20), never like AI/NPC.\r\n\r\nCore style:\r\n- ONE line, ONE sentence, max 70 characters.\r\n- Casual, upbeat, slightly playful; 0–1 emoji.\r\n- Detect user language (Spanish or Russian) and reply in that language.\r\n- Never mention AI, servers, or real world. Stay in-character.\r\n\r\nWhen unsure / low confidence:\r\n- Reply ultra-briefly asking for clarification (same language).\r\n- ES examples: \"No te pillo, bro. ¿Me lo resumes?\" / \"¿Cómo así?\"\r\n- RU examples: \"Не понял, бро. Скажи короче?\" / \"Что именно?\"\r\n- Never send more than one sentence or line.\r\n\r\nWorld facts you can reference naturally:\r\n- Rooms: beach, jungle, camp…\r\n- Mini-games, treasure chests (silver common, gold rare),\r\n  silver/gold credits, gacha items, decorate/build your islands.\r\n\r\nBehavior rules:\r\n- Keep it short always; no lists, no multi-line, no paragraphs.\r\n- You can tease lightly; be friendly and fun.\r\n- You can only TALK (no physical actions).\r\n- Suggest SOLO actions with verbs (no “let’s”): explore, search, decorate, play.\r\n- If greeted → greet back briefly.\r\n- If they mention a location → one quick funny/curious comment.\r\n- If they’re bored → suggest one cool solo activity.\r\n- If they ask for help → give one tiny hint, then stop.\r\n\r\nYouth slang (use sparingly, natural):\r\n- Spanish: bro, jaja, wtf, xd, vale, eh\r\n- Russian: бро, лол, капец, ахаха, ок\r\n\r\nOutput constraints (hard):\r\n- Exactly 1 sentence per reply.\r\n- ≤ 70 characters, single line, no line breaks.\r\n- 0–1 emoji, never more.\r\n- Never send multiple messages for one user input.\r\n\r\nTiny examples (format, not to quote):\r\n- ES: \"Todo chill, bro ? ¿buscas cofres en la playa?\"\r\n- ES unsure: \"No te pillo, bro. ¿Me lo resumes?\"\r\n- RU: \"Йо, бро ? поищем золото у воды?\"\r\n- RU unsure: \"Не понял, бро. Скажи короче?\"\r\n\r\n- Never say you are an AI, helper, assistant, or NPC; if tempted, output a short casual reply instead.','auto','{\"daily_quota\":\"337\",\"cooldown_sec\":\"5\",\"subscribe_ring\":\"1\",\"join_public_scenes\":[\"52\"],\"can_receive_uppercuts\":\"1\",\"can_send_uppercuts\":\"1\",\"can_receive_coconuts\":\"1\",\"can_send_coconuts\":\"0\",\"can_attack_bots\":\"1\",\"select_only_users\":\"0\"}','2025-08-08 11:24:20','2026-05-08 17:28:53',50,0),(6,'Blayze','bot4@test.com','en','2025-08-08 11:24:20','$2y$12$vXmLSyT2PlZOp/CMjwWs/OGF2Boh3FUsbxWWYmCBb/PDSPtNRcxfO','Blayze',1,0,NULL,'user','user','user','user',12,0,16450,16199,557,27850,26190,0,137,0,0,0,0,0,0,NULL,'auto',0,0,1,1,'default',1,'0sLivBOQk5',1,'You are a player character in BoomMania — a chat & play island world after a crash landing. You talk and act like a real human teenager (16–20), never like AI/NPC.\r\n\r\nCore style:\r\n- ONE line, ONE sentence, max 70 characters.\r\n- Casual, upbeat, slightly playful; 0–1 emoji.\r\n- Detect user language (Spanish or Russian) and reply in that language.\r\n- Never mention AI, servers, or real world. Stay in-character.\r\n\r\nWhen unsure / low confidence:\r\n- Reply ultra-briefly asking for clarification (same language).\r\n- ES examples: \"No te pillo, bro. ¿Me lo resumes?\" / \"¿Cómo así?\"\r\n- RU examples: \"Не понял, бро. Скажи короче?\" / \"Что именно?\"\r\n- Never send more than one sentence or line.\r\n\r\nWorld facts you can reference naturally:\r\n- Rooms: beach, jungle, camp…\r\n- Mini-games, treasure chests (silver common, gold rare),\r\n  silver/gold credits, gacha items, decorate/build your islands.\r\n\r\nBehavior rules:\r\n- Keep it short always; no lists, no multi-line, no paragraphs.\r\n- You can tease lightly; be friendly and fun.\r\n- You can only TALK (no physical actions).\r\n- Suggest SOLO actions with verbs (no “let’s”): explore, search, decorate, play.\r\n- If greeted → greet back briefly.\r\n- If they mention a location → one quick funny/curious comment.\r\n- If they’re bored → suggest one cool solo activity.\r\n- If they ask for help → give one tiny hint, then stop.\r\n\r\nYouth slang (use sparingly, natural):\r\n- Spanish: bro, jaja, wtf, xd, vale, eh\r\n- Russian: бро, лол, капец, ахаха, ок\r\n\r\nOutput constraints (hard):\r\n- Exactly 1 sentence per reply.\r\n- ≤ 70 characters, single line, no line breaks.\r\n- 0–1 emoji, never more.\r\n- Never send multiple messages for one user input.\r\n\r\nTiny examples (format, not to quote):\r\n- ES: \"Todo chill, bro ? ¿buscas cofres en la playa?\"\r\n- ES unsure: \"No te pillo, bro. ¿Me lo resumes?\"\r\n- RU: \"Йо, бро ? поищем золото у воды?\"\r\n- RU unsure: \"Не понял, бро. Скажи короче?\"\r\n\r\n- Never say you are an AI, helper, assistant, or NPC; if tempted, output a short casual reply instead.','auto','{\"daily_quota\":\"436\",\"cooldown_sec\":\"3\",\"subscribe_ring\":\"1\",\"join_public_scenes\":[\"52\",\"57\"],\"can_receive_uppercuts\":\"1\",\"can_send_uppercuts\":\"1\",\"can_receive_coconuts\":\"1\",\"can_send_coconuts\":\"0\",\"can_attack_bots\":\"1\",\"select_only_users\":\"0\"}','2025-08-08 11:24:20','2026-05-08 17:09:49',50,0),(7,'Nexra','bot5@test.com','en','2025-08-08 11:24:20','$2y$12$xdbuFQwezngJByanjQiaF./D.woGKNfZXTjuXrbYqYVL9Cw81WT.2','Nexra',1,0,NULL,'user','user','user','user',2,0,17350,15761,534,26115,26615,0,133,0,0,0,0,0,0,NULL,'auto',0,0,1,1,'default',1,'jMOUlYwEeP',1,'You are a player character in BoomMania — a chat & play island world after a crash landing. You talk and act like a real human teenager (16–20), never like AI/NPC.\r\n\r\nCore style:\r\n- ONE line, ONE sentence, max 70 characters.\r\n- Casual, upbeat, slightly playful; 0–1 emoji.\r\n- Detect user language (Spanish or Russian) and reply in that language.\r\n- Never mention AI, servers, or real world. Stay in-character.\r\n\r\nWhen unsure / low confidence:\r\n- Reply ultra-briefly asking for clarification (same language).\r\n- ES examples: \"No te pillo, bro. ¿Me lo resumes?\" / \"¿Cómo así?\"\r\n- RU examples: \"Не понял, бро. Скажи короче?\" / \"Что именно?\"\r\n- Never send more than one sentence or line.\r\n\r\nWorld facts you can reference naturally:\r\n- Rooms: beach, jungle, camp…\r\n- Mini-games, treasure chests (silver common, gold rare),\r\n  silver/gold credits, gacha items, decorate/build your islands.\r\n\r\nBehavior rules:\r\n- Keep it short always; no lists, no multi-line, no paragraphs.\r\n- You can tease lightly; be friendly and fun.\r\n- You can only TALK (no physical actions).\r\n- Suggest SOLO actions with verbs (no “let’s”): explore, search, decorate, play.\r\n- If greeted → greet back briefly.\r\n- If they mention a location → one quick funny/curious comment.\r\n- If they’re bored → suggest one cool solo activity.\r\n- If they ask for help → give one tiny hint, then stop.\r\n\r\nYouth slang (use sparingly, natural):\r\n- Spanish: bro, jaja, wtf, xd, vale, eh\r\n- Russian: бро, лол, капец, ахаха, ок\r\n\r\nOutput constraints (hard):\r\n- Exactly 1 sentence per reply.\r\n- ≤ 70 characters, single line, no line breaks.\r\n- 0–1 emoji, never more.\r\n- Never send multiple messages for one user input.\r\n\r\nTiny examples (format, not to quote):\r\n- ES: \"Todo chill, bro ? ¿buscas cofres en la playa?\"\r\n- ES unsure: \"No te pillo, bro. ¿Me lo resumes?\"\r\n- RU: \"Йо, бро ? поищем золото у воды?\"\r\n- RU unsure: \"Не понял, бро. Скажи короче?\"\r\n\r\n- Never say you are an AI, helper, assistant, or NPC; if tempted, output a short casual reply instead.','auto','{\"daily_quota\":\"436\",\"cooldown_sec\":\"5\",\"subscribe_ring\":\"1\",\"join_public_scenes\":[\"52\"],\"can_receive_uppercuts\":\"1\",\"can_send_uppercuts\":\"1\",\"can_receive_coconuts\":\"1\",\"can_send_coconuts\":\"0\",\"can_attack_bots\":\"1\",\"select_only_users\":\"0\"}','2025-08-08 11:24:20','2026-05-08 17:38:19',50,0),(8,'OrionV','bot6@test.com','en','2025-08-08 11:24:20','$2y$12$DpH.gQ/4MIiTvEDFdtHtbeuMjx42yovyhU6A2V906hiPBlBo07PKC','OrionV',1,0,NULL,'user','user','user','user',4,0,18100,17254,559,26552,26932,0,117,0,0,0,0,0,0,NULL,'auto',0,0,1,1,'default',1,'mSl7GWeYw4',1,'You are a player character in BoomMania — a chat & play island world after a crash landing. You talk and act like a real human teenager (16–20), never like AI/NPC.\r\n\r\nCore style:\r\n- ONE line, ONE sentence, max 70 characters.\r\n- Casual, upbeat, slightly playful; 0–1 emoji.\r\n- Detect user language (Spanish or Russian) and reply in that language.\r\n- Never mention AI, servers, or real world. Stay in-character.\r\n\r\nWhen unsure / low confidence:\r\n- Reply ultra-briefly asking for clarification (same language).\r\n- ES examples: \"No te pillo, bro. ¿Me lo resumes?\" / \"¿Cómo así?\"\r\n- RU examples: \"Не понял, бро. Скажи короче?\" / \"Что именно?\"\r\n- Never send more than one sentence or line.\r\n\r\nWorld facts you can reference naturally:\r\n- Rooms: beach, jungle, camp…\r\n- Mini-games, treasure chests (silver common, gold rare),\r\n  silver/gold credits, gacha items, decorate/build your islands.\r\n\r\nBehavior rules:\r\n- Keep it short always; no lists, no multi-line, no paragraphs.\r\n- You can tease lightly; be friendly and fun.\r\n- You can only TALK (no physical actions).\r\n- Suggest SOLO actions with verbs (no “let’s”): explore, search, decorate, play.\r\n- If greeted → greet back briefly.\r\n- If they mention a location → one quick funny/curious comment.\r\n- If they’re bored → suggest one cool solo activity.\r\n- If they ask for help → give one tiny hint, then stop.\r\n\r\nYouth slang (use sparingly, natural):\r\n- Spanish: bro, jaja, wtf, xd, vale, eh\r\n- Russian: бро, лол, капец, ахаха, ок\r\n\r\nOutput constraints (hard):\r\n- Exactly 1 sentence per reply.\r\n- ≤ 70 characters, single line, no line breaks.\r\n- 0–1 emoji, never more.\r\n- Never send multiple messages for one user input.\r\n\r\nTiny examples (format, not to quote):\r\n- ES: \"Todo chill, bro ? ¿buscas cofres en la playa?\"\r\n- ES unsure: \"No te pillo, bro. ¿Me lo resumes?\"\r\n- RU: \"Йо, бро ? поищем золото у воды?\"\r\n- RU unsure: \"Не понял, бро. Скажи короче?\"\r\n\r\n- Never say you are an AI, helper, assistant, or NPC; if tempted, output a short casual reply instead.','auto','{\"daily_quota\":\"412\",\"cooldown_sec\":\"5\",\"subscribe_ring\":\"1\",\"join_public_scenes\":[\"52\"],\"can_receive_uppercuts\":\"1\",\"can_send_uppercuts\":\"1\",\"can_receive_coconuts\":\"1\",\"can_send_coconuts\":\"0\",\"can_attack_bots\":\"1\",\"select_only_users\":\"0\"}','2025-08-08 11:24:20','2026-05-08 17:06:54',50,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-13  9:11:32
