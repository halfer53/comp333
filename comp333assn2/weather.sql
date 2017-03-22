-- phpMyAdmin SQL Dump
-- version 3.2.4
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Server version: 5.1.37
-- PHP Version: 5.2.11

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


--
-- Table structure for table `sites`
--

CREATE TABLE `weather` (
  `town` varchar(50) NOT NULL,
  `outlook` varchar(30) NOT NULL,
  `min_temp` int(11) NOT NULL DEFAULT '0',
  `max_temp` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`town`)
) ENGINE=MyISAM DEFAULT CHARSET=ascii;

--
-- Dumping data for table `weather`
--

INSERT INTO `weather` VALUES('Hamilton', 'sunny', 10, 28);
INSERT INTO `weather` VALUES('Auckland', 'cloudy', 8, 26);
INSERT INTO `weather` VALUES('Christchurch', 'fine', 9, 27);
INSERT INTO `weather` VALUES('Dunedin', 'foggy', 5, 23);
INSERT INTO `weather` VALUES('Tauranga', 'raining', 7, 24);
INSERT INTO `weather` VALUES('Wellington', 'windy', 7, 25);
